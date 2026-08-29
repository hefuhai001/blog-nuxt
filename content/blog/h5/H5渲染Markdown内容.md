
# 在HTML页面上优雅地渲染Markdown内容

Markdown是一种广泛使用的轻量级标记语言，它允许人们使用简单的文本格式编写文档，然后可以轻松地转换成HTML。

### 步骤 1: 创建HTML结构

首先，创建一个基本的HTML页面结构，并在其中包含一个用于显示Markdown内容的`div`元素。

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Markdown Rendering Example</title>
    <style>
        /* 在这里添加样式 */
    </style>
</head>
<body>
    <h1>Markdown Rendering Example</h1>
    <div id="markdown" class="markdown-content">
        <!-- 这里是Markdown文本 -->
    </div>

    <!-- 引入 showdown 库 -->
    <script src="https://cdn.jsdelivr.net/npm/showdown/dist/showdown.min.js"></script>
    <script>
        // 在这里添加JavaScript代码
    </script>
</body>
</html>
```

### 步骤 2: 添加样式

为了使Markdown内容更加美观，我们可以添加一些CSS样式。以下是一些基本的样式建议：

```css
body {
    font-family: 'Arial', sans-serif;
    background-color: #f7f7f7;
    margin: 0;
    padding: 20px;
}
h1 {
    color: #333;
    font-size: 24px;
    margin-bottom: 20px;
}
.markdown-content {
    white-space: pre-wrap;
    line-height: 1.5;
    font-size: 16px;
    background-color: #fff;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.markdown-content p {
    margin-bottom: 10px;
}
.markdown-content h1, .markdown-content h2 {
    color: #222;
}
.markdown-content ul {
    list-style-type: disc;
    margin-left: 20px;
}
.markdown-content li {
    margin-bottom: 5px;
}
.markdown-content a {
    color: #007bff;
    text-decoration: none;
}
.markdown-content a:hover {
    text-decoration: underline;
}
.markdown-content strong {
    font-weight: bold;
}
.markdown-content em {
    font-style: italic;
}
```

### 步骤 3: 添加JavaScript代码

在HTML页面中添加JavaScript代码，用于解析Markdown文本并将其转换为HTML格式。

```html
<script>
    // 创建一个 showdown 实例
    var converter = new showdown.Converter();

    // 获取Markdown文本的容器
    var markdownElement = document.getElementById('markdown');

    // 定义Markdown文本
    var markdownText = "# Hello Markdown\n\nThis is a sample Markdown text.\n\n* List item 1\n* List item 2\n\n**Bold text**\n*Italic text*";

    // 将Markdown文本转换为HTML
    var htmlContent = converter.makeHtml(markdownText);

    // 将转换后的HTML插入到容器中
    markdownElement.innerHTML = htmlContent;
</script>
```