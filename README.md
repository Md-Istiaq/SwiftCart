# JavaScript Interview Q&A

## 1. What is the difference between null and undefined?
- **undefined** means a variable has been declared but not yet assigned a value (automatic).
- **null** is an assignment value that you set manually to mean “no value” or “empty”.

## 2. What is the use of the map() function in JavaScript? How is it different from forEach()?
- **map()** loops through an array and returns a **new array** with transformed values.
- **forEach()** loops through the array to perform an action (like logging) but does **not return anything**.

## 3. What is the difference between == and ===?
- **==** checks if values are equal, but performs type coercion (e.g., `1 == "1"` is true).
- **===** checks if values **and types** are equal (e.g., `1 === "1"` is false).

## 4. What is the significance of async/await in fetching API data?
- It makes asynchronous code look and behave more like synchronous code, improving readability.
- `await` pauses the function until the API data returns, allowing you to use the result directly without `.then()` chains.

## 5. Explain the concept of Scope in JavaScript (Global, Function, Block).
- **Global scope**: variables declared outside any function – accessible everywhere.
- **Function scope**: variables declared with `var` inside a function – only exist inside that function.
- **Block scope**: variables declared with `let` or `const` inside `{ }` (e.g., in an `if` or loop) – only exist inside that block.