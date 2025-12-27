---
title: FlutterExpansionTile：支持精确上下文菜单的可展开组件
pubDatetime: 2025-12-24T11:16:00+08:00
description: FlutterExpansionTile是一个在 Flutter 原生 ExpansionTile基础上进行深度功能增强的自定义组件。该组件的核心创新在于实现了上下文菜单的精确作用域控制，将菜单交互精准限定在标题行区域（包括 leading、title 和 subtitle），而不会干扰展开箭头和子内容区域的正常操作。
category: 开发
slug: FlutterExpansionTile
tags:
- Flutter
- Flutter组件
- 跨平台开发
---

## 组件概述

`FlutterExpansionTile` 是一个在 Flutter 原生 `ExpansionTile` 基础上进行功能增强的自定义组件。其主要创新点在于**精确控制上下文菜单的触发范围**，将菜单交互限定在标题行（包括 leading、title 和 subtitle），而不会影响展开箭头和子内容区域的正常操作。

## 完整组件源代码

```dart
import 'package:flutter/material.dart';
import 'package:contextmenu/contextmenu.dart';

/// 增强版可展开列表组件，支持精确的上下文菜单控制
///
/// 该组件在原生ExpansionTile基础上，增加了上下文菜单功能，并通过精确控制
/// 菜单触发区域，提供更优秀的用户体验
class FlutterExpansionTile extends StatefulWidget {
  final Widget? leading;
  final Widget title;
  final Widget? subtitle;
  final Widget? trailing;
  final List<Widget> children;
  final Duration animationDuration;
  final Curve curve;
  final Color? iconColor;
  final EdgeInsetsGeometry? contentPadding;
  final bool initiallyExpanded;
  final ValueChanged<bool>? onExpansionChanged;
  final List<Widget>? contextMenuItems;

  const FlutterExpansionTile({
    super.key,
    this.leading,
    required this.title,
    this.subtitle,
    this.trailing,
    required this.children,
    this.animationDuration = const Duration(milliseconds: 200),
    this.curve = Curves.easeInOut,
    this.iconColor,
    this.contentPadding,
    this.initiallyExpanded = false,
    this.onExpansionChanged,
    this.contextMenuItems,
  });

  @override
  State<FlutterExpansionTile> createState() => _FlutterExpansionTileState();
}

class _FlutterExpansionTileState extends State<FlutterExpansionTile>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _iconAnimation;
  late Animation<double> _heightAnimation;
  bool _isExpanded = false;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: widget.animationDuration, 
      vsync: this
    );
    
    _isExpanded = widget.initiallyExpanded;
    
    if (_isExpanded) {
      _controller.value = 1.0;
    }

    _iconAnimation = Tween<double>(begin: 0.0, end: 0.5).animate(_controller);
    _heightAnimation = CurvedAnimation(
      parent: _controller, 
      curve: widget.curve
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  /// 切换展开/收起状态
  void _toggleExpand() {
    setState(() {
      _isExpanded = !_isExpanded;
      if (_isExpanded) {
        _controller.forward();
      } else {
        _controller.reverse();
      }
      widget.onExpansionChanged?.call(_isExpanded);
    });
  }

  @override
  Widget build(BuildContext context) {
    // 判断是否有上下文菜单
    final hasContextMenu = widget.contextMenuItems != null && widget.contextMenuItems!.isNotEmpty;
    
    // 构建标题行
    Widget titleRow = ListTile(
      onTap: _toggleExpand,
      contentPadding: widget.contentPadding,
      leading: widget.leading,
      title: widget.title,
      subtitle: widget.subtitle,
      trailing: OverflowBar(
        spacing: 12,
        children: [
          if (widget.trailing != null) widget.trailing!,
          RotationTransition(
            turns: _iconAnimation,
            child: Icon(
              Icons.expand_more,
              color: widget.iconColor ?? Theme.of(context).iconTheme.color,
            ),
          ),
        ],
      ),
    );

    // 精确控制：只有标题行支持上下文菜单
    if (hasContextMenu) {
      titleRow = ContextMenuArea(
        width: 160,
        builder: (BuildContext context) => widget.contextMenuItems!,
        child: titleRow,
      );
    }

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        // 标题行（可能被ContextMenuArea包裹）
        titleRow,
        // 内容展开动画（不受ContextMenu影响）
        SizeTransition(
          sizeFactor: _heightAnimation,
          axisAlignment: -1.0,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: widget.children,
          ),
        ),
      ],
    );
  }
}
```

## 核心特性详解

### 1. 精确的上下文菜单控制

传统的上下文菜单实现往往将整个组件作为触发区域，这会导致用户在与展开箭头交互时意外触发菜单。`FlutterExpansionTile` 通过条件渲染策略解决了这一问题：

```dart
// 精确控制：只有标题行支持上下文菜单
if (hasContextMenu) {
  titleRow = ContextMenuArea(
    builder: (BuildContext context) => widget.contextMenuItems!,
    child: titleRow, // 仅标题行有菜单功能
  );
}
```

这种设计带来以下优势：
- **避免误操作**：展开箭头保持纯净的展开/收起功能
- **符合直觉**：用户自然地在标题区域触发右键操作
- **平台自适应**：自动适配桌面端右键和移动端长按手势

### 2. 流畅的动画系统

组件内置完整的动画控制系统，基于 Flutter 的 `AnimationController` 实现：

```dart
@override
void initState() {
  super.initState();
  _controller = AnimationController(
    duration: widget.animationDuration, 
    vsync: this
  );
  
  _iconAnimation = Tween<double>(begin: 0.0, end: 0.5).animate(_controller);
  _heightAnimation = CurvedAnimation(parent: _controller, curve: widget.curve);
}
```

- **旋转动画**：控制展开箭头从 0° 到 180° 的旋转效果
- **高度动画**：管理内容区域的平滑展开和收起
- **完全可定制**：支持自定义动画时长和曲线

### 3. 灵活的布局配置

与原生 `ExpansionTile` 类似，组件支持完整的布局元素配置：

```dart
FlutterExpansionTile(
  leading: Icon(Icons.folder),                    // 标题前导图标
  title: Text('项目文档'),                        // 主标题内容
  subtitle: Text('3个文件'),                      // 副标题信息
  trailing: Icon(Icons.star_border),             // 尾部自定义组件
  children: [/* 展开内容 */],                     // 子内容区域
  contentPadding: EdgeInsets.all(12),             // 内边距控制
);
```

## 使用指南

### 基础用法（无菜单功能）

```dart
FlutterExpansionTile(
  title: Text('基础可展开项'),
  children: [
    ListTile(title: Text('子项1')),
    ListTile(title: Text('子项2')),
  ],
)
```

### 完整功能示例

```dart
FlutterExpansionTile(
  leading: Icon(Icons.work),
  title: Text('项目计划'),
  subtitle: Text('最后更新: 2024-01-15'),
  trailing: IconButton(
    icon: Icon(Icons.star_border),
    onPressed: () => toggleFavorite(),
  ),
  children: [
    ListTile(leading: Icon(Icons.checklist), title: Text('任务清单')),
    ListTile(leading: Icon(Icons.schedule), title: Text('时间安排')),
  ],
  animationDuration: Duration(milliseconds: 300),
  initiallyExpanded: true,
  onExpansionChanged: (isExpanded) {
    print('展开状态: $isExpanded');
  },
  contextMenuItems: [
    ListTile(
      dense: true,
      leading: Icon(Icons.edit, size: 20),
      title: Text('重命名项目'),
      onTap: () {
        Navigator.of(context).pop();
        _renameProject();
      },
    ),
    ListTile(
      dense: true,
      leading: Icon(Icons.copy, size: 20),
      title: Text('复制项目'),
      onTap: () {
        Navigator.of(context).pop();
        _duplicateProject();
      },
    ),
    ListTile(
      dense: true,
      leading: Icon(Icons.delete, size: 20),
      title: Text('删除项目', style: TextStyle(color: Colors.red)),
      onTap: () {
        Navigator.of(context).pop();
        _deleteProject();
      },
    ),
  ],
)
```

### 动画定制示例

```dart
FlutterExpansionTile(
  title: Text('自定义动画'),
  children: [/* 内容 */],
  animationDuration: Duration(milliseconds: 500), // 动画时长
  curve: Curves.easeInOutBack,                    // 动画曲线
  iconColor: Colors.blue,                        // 图标颜色
)
```

## 应用场景

### 1. 文件管理系统
在文件浏览器中，每个文件夹项可以使用 `FlutterExpansionTile`，标题行提供文件操作菜单（重命名、移动、删除），而展开区域显示文件内容预览。

### 2. 设置界面分组
应用的设置页面可以使用该组件对相关设置项进行分组，标题行提供快速操作菜单，展开区域显示详细设置选项。

### 3. 数据导航界面
对于需要展示层次化数据的场景，如商品分类、组织架构等，可以提供精确的数据操作体验。

## 总结

`FlutterExpansionTile` 组件通过**精确控制上下文菜单的作用范围**，解决了传统实现中菜单触发区域过大的问题。这种设计既保留了上下文菜单的便利性，又避免了与展开功能的操作冲突，显著提升了用户体验。

**核心价值**：
- **交互精确性**：菜单仅响应标题行操作，展开箭头功能纯净
- **平台适应性**：自动适配桌面端和移动端的交互习惯
- **性能优化**：条件渲染策略确保高效运行
- **开发友好**：简洁的 API 设计，易于集成和使用

该组件特别适合需要精细交互控制的复杂应用场景，是构建现代化 Flutter 应用的理想选择。