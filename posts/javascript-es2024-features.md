# JavaScript ES2024 新特性详解

> 发布日期：2025-01-15  
> 分类：前端开发  
> 标签：JavaScript, ES2024, 新特性

JavaScript 持续演进，ES2024 版本带来了许多令人兴奋的新特性。本文将深入探讨这些新功能如何改善我们的开发体验。

## 🚀 新的数组方法

ES2024 引入了几个新的数组方法，这些方法的特点是不会修改原数组：

### Array.prototype.toReversed()

```javascript
const original = [1, 2, 3, 4, 5];
const reversed = original.toReversed(); // [5, 4, 3, 2, 1]
console.log(original); // [1, 2, 3, 4, 5] - 原数组不变
```

### Array.prototype.toSorted()

```javascript
const numbers = [3, 1, 4, 1, 5];
const sorted = numbers.toSorted(); // [1, 1, 3, 4, 5]
console.log(numbers); // [3, 1, 4, 1, 5] - 原数组不变

// 自定义排序
const people = [
    { name: 'Alice', age: 25 },
    { name: 'Bob', age: 30 },
    { name: 'Charlie', age: 20 }
];

const sortedByAge = people.toSorted((a, b) => a.age - b.age);
```

### Array.prototype.toSpliced()

```javascript
const fruits = ['apple', 'banana', 'orange'];
const modified = fruits.toSpliced(1, 1, 'grape', 'kiwi');
// ['apple', 'grape', 'kiwi', 'orange']
console.log(fruits); // ['apple', 'banana', 'orange'] - 原数组不变
```

## 🎨 装饰器语法

装饰器终于成为了标准的一部分，为类和方法提供了强大的元编程能力：

```javascript
// 缓存装饰器
function cache(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value;
    const cacheMap = new Map();
    
    descriptor.value = function(...args) {
        const key = JSON.stringify(args);
        if (cacheMap.has(key)) {
            return cacheMap.get(key);
        }
        
        const result = originalMethod.apply(this, args);
        cacheMap.set(key, result);
        return result;
    };
}

// 重试装饰器
function retry(maxAttempts) {
    return function(target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        
        descriptor.value = async function(...args) {
            let attempts = 0;
            while (attempts < maxAttempts) {
                try {
                    return await originalMethod.apply(this, args);
                } catch (error) {
                    attempts++;
                    if (attempts === maxAttempts) {
                        throw error;
                    }
                    await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
                }
            }
        };
    };
}

// 使用装饰器
class ApiService {
    @cache
    @retry(3)
    async fetchUserData(userId) {
        const response = await fetch(`/api/users/${userId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch user data');
        }
        return response.json();
    }
}
```

## 🔧 新的内置方法

### Object.groupBy()

```javascript
const students = [
    { name: 'Alice', grade: 'A', subject: 'Math' },
    { name: 'Bob', grade: 'B', subject: 'Science' },
    { name: 'Charlie', grade: 'A', subject: 'Math' },
    { name: 'David', grade: 'C', subject: 'Science' }
];

// 按成绩分组
const groupedByGrade = Object.groupBy(students, student => student.grade);
console.log(groupedByGrade);
// {
//   A: [{ name: 'Alice', grade: 'A', subject: 'Math' }, { name: 'Charlie', grade: 'A', subject: 'Math' }],
//   B: [{ name: 'Bob', grade: 'B', subject: 'Science' }],
//   C: [{ name: 'David', grade: 'C', subject: 'Science' }]
// }
```

### Promise.withResolvers()

```javascript
// 传统方式
let resolve, reject;
const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
});

// ES2024 新方式
const { promise, resolve, reject } = Promise.withResolvers();

// 实际应用
function createCancellableTask() {
    const { promise, resolve, reject } = Promise.withResolvers();
    
    const timeoutId = setTimeout(() => {
        resolve('Task completed!');
    }, 5000);
    
    return {
        promise,
        cancel: () => {
            clearTimeout(timeoutId);
            reject(new Error('Task cancelled'));
        }
    };
}
```

## 📊 性能对比

新的数组方法虽然创建了新数组，但在现代 JavaScript 引擎中性能表现良好：

```javascript
// 性能测试
const largeArray = Array.from({ length: 1000000 }, (_, i) => i);

console.time('原始 reverse');
const reversed1 = [...largeArray].reverse();
console.timeEnd('原始 reverse');

console.time('toReversed');
const reversed2 = largeArray.toReversed();
console.timeEnd('toReversed');
```

## 🎯 最佳实践

1. **使用不可变方法**：优先使用 `toReversed()`、`toSorted()` 等新方法
2. **装饰器设计**：保持装饰器的单一职责原则
3. **错误处理**：配合 `Promise.withResolvers()` 实现更好的异步控制

## 🚀 总结

ES2024 的这些新特性将显著提升 JavaScript 的开发体验：

- **更安全的数组操作**：不可变方法减少了意外修改的风险
- **更强大的元编程**：装饰器为代码组织提供了新的可能性
- **更好的异步控制**：新的 Promise 工具简化了复杂的异步场景

建议开发者逐步学习和应用这些新功能，让代码更加现代化和健壮。

---

*如果你觉得这篇文章有帮助，欢迎分享和讨论！*
