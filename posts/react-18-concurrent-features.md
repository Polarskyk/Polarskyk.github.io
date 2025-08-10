# React 18 并发特性实践指南

> 发布日期：2025-01-12  
> 分类：前端开发  
> 标签：React, React 18, 并发渲染, Suspense

React 18 的并发特性是框架发展的重要里程碑。这些新功能为用户体验带来了革命性的改进，让应用更加流畅和响应迅速。

## 🎯 并发渲染概述

并发渲染允许 React 暂停、恢复或放弃渲染工作，优先处理更重要的更新：

```jsx
import { createRoot } from 'react-dom/client';

// 启用并发模式
const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);
```

## 🚀 Suspense 进阶用法

### 数据获取与 Suspense

```jsx
import { Suspense, useState } from 'react';

// 模拟数据获取函数
function fetchUserData(userId) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                id: userId,
                name: `User ${userId}`,
                email: `user${userId}@example.com`
            });
        }, Math.random() * 2000 + 1000);
    });
}

// 创建 Resource
function createResource(promise) {
    let status = 'pending';
    let result;
    
    const suspender = promise.then(
        (data) => {
            status = 'success';
            result = data;
        },
        (error) => {
            status = 'error';
            result = error;
        }
    );
    
    return {
        read() {
            if (status === 'pending') {
                throw suspender;
            } else if (status === 'error') {
                throw result;
            } else if (status === 'success') {
                return result;
            }
        }
    };
}

// 用户资料组件
function UserProfile({ userId }) {
    const [resource] = useState(() => createResource(fetchUserData(userId)));
    const user = resource.read();
    
    return (
        <div className="user-profile">
            <h2>{user.name}</h2>
            <p>Email: {user.email}</p>
            <p>ID: {user.id}</p>
        </div>
    );
}

// 加载组件
function LoadingSpinner() {
    return (
        <div className="loading-container">
            <div className="spinner"></div>
            <p>正在加载用户信息...</p>
        </div>
    );
}

// 错误边界组件
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }
    
    static getDerivedStateFromError(error) {
        return { hasError: true };
    }
    
    componentDidCatch(error, errorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
    }
    
    render() {
        if (this.state.hasError) {
            return (
                <div className="error-container">
                    <h2>出错了！</h2>
                    <p>加载用户信息时发生错误。</p>
                    <button onClick={() => this.setState({ hasError: false })}>
                        重试
                    </button>
                </div>
            );
        }
        
        return this.props.children;
    }
}

// 主应用组件
function App() {
    const [userId, setUserId] = useState(1);
    
    return (
        <div className="app">
            <header>
                <h1>用户管理系统</h1>
                <div className="user-selector">
                    {[1, 2, 3, 4, 5].map(id => (
                        <button 
                            key={id}
                            onClick={() => setUserId(id)}
                            className={userId === id ? 'active' : ''}
                        >
                            用户 {id}
                        </button>
                    ))}
                </div>
            </header>
            
            <main>
                <ErrorBoundary>
                    <Suspense fallback={<LoadingSpinner />}>
                        <UserProfile userId={userId} />
                    </Suspense>
                </ErrorBoundary>
            </main>
        </div>
    );
}
```

## 🔄 startTransition 优化用户交互

`startTransition` 允许我们标记某些更新为非紧急的，从而保持界面的响应性：

```jsx
import { startTransition, useState, useDeferredValue } from 'react';

function SearchResults() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isPending, setIsPending] = useState(false);
    
    // 使用 useDeferredValue 延迟更新
    const deferredQuery = useDeferredValue(query);
    
    const handleSearch = (newQuery) => {
        // 立即更新搜索框的值（紧急更新）
        setQuery(newQuery);
        
        // 延迟更新搜索结果（非紧急更新）
        startTransition(() => {
            setIsPending(true);
            // 模拟搜索 API
            setTimeout(() => {
                const mockResults = Array.from({ length: 50 }, (_, i) => ({
                    id: i,
                    title: `搜索结果 ${i + 1} - ${newQuery}`,
                    description: `这是包含 "${newQuery}" 的搜索结果描述...`
                }));
                setResults(mockResults);
                setIsPending(false);
            }, 500);
        });
    };
    
    return (
        <div className="search-container">
            <div className="search-header">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="搜索..."
                    className="search-input"
                />
                {isPending && (
                    <div className="search-indicator">
                        <span className="loading-dot"></span>
                        搜索中...
                    </div>
                )}
            </div>
            
            <div className="search-results">
                {results.map(result => (
                    <div key={result.id} className="search-result-item">
                        <h3>{result.title}</h3>
                        <p>{result.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
```

## 🎨 useDeferredValue 优化渲染

```jsx
function ExpensiveComponent({ data }) {
    // 延迟处理大量数据
    const deferredData = useDeferredValue(data);
    
    // 模拟昂贵的计算
    const processedData = useMemo(() => {
        return deferredData.map(item => ({
            ...item,
            processed: true,
            timestamp: Date.now()
        }));
    }, [deferredData]);
    
    return (
        <div className="expensive-component">
            {processedData.map(item => (
                <div key={item.id} className="data-item">
                    <h4>{item.name}</h4>
                    <p>处理时间: {item.timestamp}</p>
                </div>
            ))}
        </div>
    );
}

function DataVisualization() {
    const [rawData, setRawData] = useState([]);
    const [filter, setFilter] = useState('');
    
    // 过滤数据（紧急更新）
    const filteredData = useMemo(() => {
        return rawData.filter(item => 
            item.name.toLowerCase().includes(filter.toLowerCase())
        );
    }, [rawData, filter]);
    
    // 生成测试数据
    const generateData = () => {
        const newData = Array.from({ length: 1000 }, (_, i) => ({
            id: i,
            name: `数据项 ${i + 1}`,
            value: Math.random() * 100
        }));
        setRawData(newData);
    };
    
    return (
        <div className="data-visualization">
            <div className="controls">
                <button onClick={generateData}>
                    生成数据
                </button>
                <input
                    type="text"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    placeholder="过滤数据..."
                />
            </div>
            
            <Suspense fallback={<div>正在处理数据...</div>}>
                <ExpensiveComponent data={filteredData} />
            </Suspense>
        </div>
    );
}
```

## 🛠️ 自定义 Hook 最佳实践

```jsx
import { useCallback, useTransition } from 'react';

// 自定义 Hook：异步状态管理
function useAsyncState(initialState) {
    const [state, setState] = useState(initialState);
    const [isPending, startTransition] = useTransition();
    
    const setAsyncState = useCallback((newState) => {
        startTransition(() => {
            setState(newState);
        });
    }, []);
    
    return [state, setAsyncState, isPending];
}

// 自定义 Hook：搜索功能
function useSearch(searchFn, debounceMs = 300) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isPending, startTransition] = useTransition();
    
    const debouncedQuery = useDebounce(query, debounceMs);
    
    useEffect(() => {
        if (debouncedQuery) {
            startTransition(async () => {
                try {
                    const searchResults = await searchFn(debouncedQuery);
                    setResults(searchResults);
                } catch (error) {
                    console.error('Search failed:', error);
                    setResults([]);
                }
            });
        } else {
            setResults([]);
        }
    }, [debouncedQuery, searchFn]);
    
    return {
        query,
        setQuery,
        results,
        isPending
    };
}

// 防抖 Hook
function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    
    return debouncedValue;
}
```

## 📊 性能监控

```jsx
import { Profiler } from 'react';

function onRenderCallback(id, phase, actualDuration, baseDuration, startTime, commitTime) {
    console.log('Profiler data:', {
        id,
        phase,
        actualDuration,
        baseDuration,
        startTime,
        commitTime
    });
    
    // 发送性能数据到分析服务
    if (actualDuration > 16) { // 超过一帧的时间
        console.warn(`Slow render detected in ${id}: ${actualDuration}ms`);
    }
}

function App() {
    return (
        <Profiler id="App" onRender={onRenderCallback}>
            <Header />
            <Main />
            <Footer />
        </Profiler>
    );
}
```

## 🎯 最佳实践总结

1. **合理使用 Suspense**：为异步操作提供优雅的加载状态
2. **startTransition 优化交互**：区分紧急和非紧急更新
3. **useDeferredValue 处理大量数据**：避免阻塞用户输入
4. **错误边界保护**：确保应用的稳定性
5. **性能监控**：使用 Profiler 识别性能瓶颈

React 18 的并发特性让我们能够构建更加流畅和响应迅速的用户界面。通过合理使用这些新功能，我们可以显著提升用户体验。

---

*持续学习，拥抱变化！React 18 为前端开发带来了新的可能性。*
