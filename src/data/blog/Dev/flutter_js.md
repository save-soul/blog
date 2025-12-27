---
title: 在 Flutter 中运行 JavaScript：flutter_js 完全指南
pubDatetime: 2025-12-27T18:30:00+08:00
description: flutter_js 是一个专业的 Flutter 插件，为开发者提供了在 Flutter 应用中执行 JavaScript 代码的能力。该插件通过跨平台的 JavaScript 运行时环境，实现了不依赖 WebView 的轻量级 JavaScript 执行方案，支持在 iOS、Android、Web、Windows、macOS 和 Linux 等全平台上运行。相较于传统方案，flutter_js 具有更优的性能表现、更小的资源占用和更完善的双向通信机制，适合需要在 Flutter 应用中集成 JavaScript 计算逻辑、复用现有 JS 代码库或构建动态脚本功能的开发场景。
category: 开发
slug: flutter_js
tags:
- Flutter
- JavaScript
- 跨平台开发
- flutter_js
---

## 什么是 flutter_js？

`flutter_js` 是一个强大的 Flutter 插件，它允许你在 Flutter 应用中执行 JavaScript 代码。这个库提供了跨平台的 JavaScript 运行时环境，让你能够在移动端、Web 端和桌面端无缝运行 JS 代码。

## 主要特性

1. **跨平台支持**：支持 iOS、Android、Web、Windows、macOS 和 Linux
2. **多引擎支持**：在不同平台上使用最优化的 JavaScript 引擎
3. **简单易用的 API**：直观的接口让 JavaScript 执行变得简单
4. **异步支持**：完美处理异步 JavaScript 代码
5. **双向通信**：支持 Dart 和 JavaScript 之间的相互调用

## 安装

在 `pubspec.yaml` 中添加依赖：

```yaml
dependencies:
  flutter_js: ^0.8.5
```

然后运行：
```bash
flutter pub get
```

## 与其他库的对比优势

- 不需要 WebView 组件即可运行 JavaScript
- 更轻量级，性能更好
- 支持多种 JavaScript 引擎
- 提供更细粒度的控制

## 基本使用示例

### 1. 初始化 JavaScript 运行时

```dart
import 'package:flutter_js/flutter_js.dart';

void main() async {
  // 创建 JavaScript 运行时
  final jsRuntime = getJavascriptRuntime();
  
  // 执行简单的 JavaScript 代码
  final result = jsRuntime.evaluate('1 + 2');
  print('Result: ${result.rawResult}'); // 输出: 3
  print('String result: ${result.stringResult}'); // 输出: 3
  
  // 记得释放资源
  jsRuntime.dispose();
}
```

### 2. 执行复杂 JavaScript 代码

```dart
void executeComplexJavaScript() {
  final jsRuntime = getJavascriptRuntime();
  
  // 定义 JavaScript 函数
  const jsCode = '''
    function greet(name) {
      return 'Hello, ' + name + '!';
    }
    
    function calculateCircleArea(radius) {
      return Math.PI * radius * radius;
    }
    
    // 调用函数
    const greeting = greet('World');
    const area = calculateCircleArea(5);
    
    // 返回对象
    ({ greeting, area, timestamp: Date.now() });
  ''';
  
  final result = jsRuntime.evaluate(jsCode);
  
  if (!result.isError) {
    // 解析返回的 JSON
    final jsonResult = result.rawResult as Map<String, dynamic>;
    print('Greeting: ${jsonResult['greeting']}');
    print('Area: ${jsonResult['area']}');
    print('Timestamp: ${jsonResult['timestamp']}');
  } else {
    print('Error: ${result.stringResult}');
  }
  
  jsRuntime.dispose();
}
```

## 高级功能

### 3. Dart 与 JavaScript 互操作

```dart
void dartJsInterop() {
  final jsRuntime = getJavascriptRuntime();
  
  // 从 Dart 调用 JavaScript 函数
  jsRuntime.evaluate('''
    window.multiply = function(a, b) {
      return a * b;
    };
    
    window.user = {
      name: 'Alice',
      age: 30,
      greet: function() {
        return 'I am ' + this.name;
      }
    };
  ''');
  
  // 调用 JavaScript 函数
  final multiplyResult = jsRuntime.evaluate('multiply(6, 7)');
  print('6 * 7 = ${multiplyResult.rawResult}'); // 输出: 42
  
  // 访问 JavaScript 对象
  final userName = jsRuntime.evaluate('user.name');
  print('User name: ${userName.stringResult}'); // 输出: Alice
  
  final greetResult = jsRuntime.evaluate('user.greet()');
  print('Greet: ${greetResult.stringResult}'); // 输出: I am Alice
  
  // 修改 JavaScript 对象
  jsRuntime.evaluate('user.age = 31');
  final updatedAge = jsRuntime.evaluate('user.age');
  print('Updated age: ${updatedAge.rawResult}'); // 输出: 31
  
  jsRuntime.dispose();
}
```

### 4. 在 JavaScript 中调用 Dart 函数

```dart
void callDartFromJs() {
  final jsRuntime = getJavascriptRuntime();
  
  // 注册 Dart 回调函数到 JavaScript
  jsRuntime.onMessage('dartFunction', (args) {
    print('Called from JavaScript with args: $args');
    return 'Hello from Dart!';
  });
  
  // 注册异步 Dart 函数
  jsRuntime.onMessage('fetchData', (args) async {
    // 模拟异步操作
    await Future.delayed(Duration(seconds: 1));
    return {'status': 'success', 'data': [1, 2, 3, 4, 5]};
  });
  
  // 在 JavaScript 中调用 Dart 函数
  jsRuntime.evaluate('''
    // 调用同步 Dart 函数
    const dartResponse = callDartFunction('dartFunction', ['param1', 123]);
    console.log('Dart response:', dartResponse);
    
    // 调用异步 Dart 函数
    callDartFunction('fetchData', []).then(response => {
      console.log('Async response:', response);
    }).catch(error => {
      console.error('Error:', error);
    });
  ''');
  
  // 注意：实际使用时需要根据 flutter_js 版本调整 API
  jsRuntime.dispose();
}
```

### 5. 处理 JavaScript Promise 和异步代码

```dart
Future<void> handleAsyncJavaScript() async {
  final jsRuntime = getJavascriptRuntime();
  
  const asyncJsCode = '''
    async function fetchData() {
      // 模拟异步操作
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            data: [1, 2, 3],
            message: 'Data fetched successfully'
          });
        }, 1000);
      });
    }
    
    // 调用异步函数
    fetchData();
  ''';
  
  try {
    final result = await jsRuntime.evaluateAsync(asyncJsCode);
    
    if (!result.isError) {
      print('Async result: ${result.rawResult}');
    } else {
      print('Error: ${result.stringResult}');
    }
  } catch (e) {
    print('Exception: $e');
  }
  
  jsRuntime.dispose();
}
```

### 6. 完整的 Flutter 应用示例

```dart
import 'package:flutter/material.dart';
import 'package:flutter_js/flutter_js.dart';

void main() => runApp(FlutterJSApp());

class FlutterJSApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter JS Demo',
      theme: ThemeData(primarySwatch: Colors.blue),
      home: JSDemoScreen(),
    );
  }
}

class JSDemoScreen extends StatefulWidget {
  @override
  _JSDemoScreenState createState() => _JSDemoScreenState();
}

class _JSDemoScreenState extends State<JSDemoScreen> {
  late JavascriptRuntime jsRuntime;
  String output = '';
  TextEditingController codeController = TextEditingController(
    text: '''
// 输入你的 JavaScript 代码
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// 计算斐波那契数列
const result = fibonacci(10);
`斐波那契数列第10项: \${result}`;
    ''',
  );

  @override
  void initState() {
    super.initState();
    jsRuntime = getJavascriptRuntime();
  }

  @override
  void dispose() {
    jsRuntime.dispose();
    super.dispose();
  }

  void executeCode() {
    try {
      final result = jsRuntime.evaluate(codeController.text);
      
      setState(() {
        if (!result.isError) {
          output = '✅ 执行成功:\n${result.stringResult}';
        } else {
          output = '❌ 执行错误:\n${result.stringResult}';
        }
      });
    } catch (e) {
      setState(() {
        output = '🚨 异常:\n$e';
      });
    }
  }

  void runExample(String exampleName) {
    Map<String, String> examples = {
      '数学计算': '''
// 数学计算示例
const radius = 5;
const area = Math.PI * Math.pow(radius, 2);
const circumference = 2 * Math.PI * radius;

`半径为\${radius}的圆:
面积: \${area.toFixed(2)}
周长: \${circumference.toFixed(2)}`;
      ''',
      '数组操作': '''
// 数组操作示例
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const evens = numbers.filter(n => n % 2 === 0);
const sum = numbers.reduce((acc, n) => acc + n, 0);
const average = sum / numbers.length;

`原始数组: [\${numbers.join(', ')}]
偶数: [\${evens.join(', ')}]
总和: \${sum}
平均值: \${average}`;
      ''',
      '日期处理': '''
// 日期处理示例
const now = new Date();
const formattedDate = now.toLocaleDateString();
const formattedTime = now.toLocaleTimeString();
const dayOfWeek = ['日', '一', '二', '三', '四', '五', '六'][now.getDay()];

`当前时间: 
日期: \${formattedDate}
时间: \${formattedTime}
星期\${dayOfWeek}`;
      ''',
    };

    codeController.text = examples[exampleName] ?? '';
    executeCode();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Flutter JS 演示'),
        actions: [
          PopupMenuButton<String>(
            onSelected: runExample,
            itemBuilder: (context) => [
              PopupMenuItem(value: '数学计算', child: Text('数学计算')),
              PopupMenuItem(value: '数组操作', child: Text('数组操作')),
              PopupMenuItem(value: '日期处理', child: Text('日期处理')),
            ],
            icon: Icon(Icons.menu),
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Expanded(
              child: Card(
                child: Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'JavaScript 代码',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                        ),
                      ),
                      SizedBox(height: 8),
                      Expanded(
                        child: TextField(
                          controller: codeController,
                          maxLines: null,
                          expands: true,
                          decoration: InputDecoration(
                            border: OutlineInputBorder(),
                            contentPadding: EdgeInsets.all(12),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
            SizedBox(height: 16),
            ElevatedButton(
              onPressed: executeCode,
              child: Padding(
                padding: const EdgeInsets.symmetric(vertical: 12),
                child: Text(
                  '执行 JavaScript 代码',
                  style: TextStyle(fontSize: 16),
                ),
              ),
            ),
            SizedBox(height: 16),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(12.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '执行结果',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                      ),
                    ),
                    SizedBox(height: 8),
                    Container(
                      width: double.infinity,
                      padding: EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.grey[100],
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: SelectableText(
                        output.isEmpty ? '结果将显示在这里...' : output,
                        style: TextStyle(fontFamily: 'monospace'),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
```

## 最佳实践

### 1. 资源管理
```dart
class JSExecutor {
  late JavascriptRuntime _runtime;
  
  JSExecutor() {
    _runtime = getJavascriptRuntime();
  }
  
  // 单例模式确保只有一个运行时
  static final JSExecutor _instance = JSExecutor._internal();
  factory JSExecutor() => _instance;
  JSExecutor._internal();
  
  Future<dynamic> evaluate(String code) async {
    try {
      return _runtime.evaluate(code);
    } catch (e) {
      print('JS Execution Error: $e');
      rethrow;
    }
  }
  
  void dispose() {
    _runtime.dispose();
  }
}
```

### 2. 错误处理
```dart
void safeJSEvaluation() {
  final jsRuntime = getJavascriptRuntime();
  
  try {
    final result = jsRuntime.evaluate('''
      // 可能出错的代码
      undefinedVariable.someMethod();
    ''');
    
    if (result.isError) {
      print('JavaScript 错误: ${result.stringResult}');
      // 处理错误逻辑
    } else {
      print('结果: ${result.rawResult}');
    }
  } catch (e) {
    print('Dart 层异常: $e');
  } finally {
    jsRuntime.dispose();
  }
}
```

### 3. 性能优化
```dart
void optimizedJSUsage() {
  final jsRuntime = getJavascriptRuntime();
  
  // 预编译常用函数
  jsRuntime.evaluate('''
    // 预编译复杂的计算函数
    window.calculations = {
      // 使用 memoization 优化递归函数
      fibonacci: (function() {
        const cache = {};
        return function fib(n) {
          if (n in cache) return cache[n];
          if (n <= 1) return n;
          cache[n] = fib(n - 1) + fib(n - 2);
          return cache[n];
        };
      })(),
      
      // 其他预编译函数...
    };
  ''');
  
  // 多次使用预编译的函数
  for (var i = 0; i < 10; i++) {
    final result = jsRuntime.evaluate('calculations.fibonacci($i)');
    print('fib($i) = ${result.rawResult}');
  }
  
  jsRuntime.dispose();
}
```

## 常见问题

### 1. 内存泄漏
```dart
// ❌ 错误：每次调用都创建新的运行时
void badPractice() {
  final jsRuntime = getJavascriptRuntime(); // 每次都创建新的
  jsRuntime.evaluate('someCode()');
  // 忘记 dispose() 会导致内存泄漏
}

// ✅ 正确：复用运行时并妥善管理
class GoodPractice {
  late JavascriptRuntime _jsRuntime;
  bool _isDisposed = false;
  
  GoodPractice() {
    _jsRuntime = getJavascriptRuntime();
  }
  
  void evaluateCode(String code) {
    if (_isDisposed) throw Exception('Runtime已释放');
    _jsRuntime.evaluate(code);
  }
  
  void dispose() {
    if (!_isDisposed) {
      _jsRuntime.dispose();
      _isDisposed = true;
    }
  }
}
```

### 2. 跨平台差异
```dart
void handlePlatformDifferences() {
  final jsRuntime = getJavascriptRuntime();
  
  // 使用特性检测
  jsRuntime.evaluate('''
    // 检测可用的 API
    const features = {
      hasBigInt: typeof BigInt !== 'undefined',
      hasPromise: typeof Promise !== 'undefined',
      hasFetch: typeof fetch !== 'undefined',
      hasLocalStorage: typeof localStorage !== 'undefined',
    };
    
    // 根据可用特性调整代码
    if (features.hasPromise) {
      // 使用 Promise
    } else {
      // 回退方案
    }
  ''');
}
```

## 总结

`flutter_js` 是一个功能强大且灵活的库，它让在 Flutter 应用中运行 JavaScript 代码变得简单。相比其他解决方案，它提供了更好的性能、更小的包体积和更灵活的集成方式。

**适用场景**：
- 需要在应用中运行 JavaScript 计算
- 集成 JavaScript 库到 Flutter 应用
- 实现插件系统，允许动态加载 JavaScript 代码
- 在移动端复用 Web 端的业务逻辑
- 创建跨平台的脚本执行环境

**注意事项**：
1. 始终妥善管理 JavascriptRuntime 的生命周期
2. 注意跨平台的 JavaScript 环境差异
3. 对于复杂计算，考虑性能影响
4. 合理处理异步操作

通过合理使用 `flutter_js`，你可以充分利用 JavaScript 生态系统的丰富资源，同时保持 Flutter 应用的高性能和良好体验。