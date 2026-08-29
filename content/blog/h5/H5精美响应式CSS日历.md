# 打造精美响应式CSS日历：从基础到高级样式

在这篇文章中，我们将学习如何使用HTML和CSS创建一个简洁而美观的日历样式。我们将从基础的日历结构开始，逐步添加样式，并使用CSS的媒体查询为不同屏幕尺寸进行适配。通过本教程，您将掌握如何制作一个响应式的日历，它不仅能够在桌面上展示，也能很好地适应移动设备。

## 1. 创建日历的基本结构

首先，我们需要创建日历的HTML结构。日历由三个主要部分组成：月份和年份的标题、星期的简称、以及日期列表。

```html
<div class="month">
    <ul>
        <li class="prev">❮</li>
        <li class="next">❯</li>
        <li style="text-align:center">
            August<br>
            <span style="font-size:18px">2016</span>
        </li>
    </ul>
</div>

<ul class="weekdays">
    <li>Mo</li>
    <li>Tu</li>
    <li>We</li>
    <li>Th</li>
    <li>Fr</li>
    <li>Sa</li>
    <li>Su</li>
</ul>

<ul class="days">
    <!-- 日期列表 -->
</ul>
```

## 2. 添加CSS样式

接下来，我们将使用CSS为日历添加样式。我们将设置基本的样式，如字体、背景色、文本对齐等，并使用伪类和伪元素来添加箭头图标。

```css
/* 基础样式 */
* {
    box-sizing: border-box;
}

ul {
    list-style-type: none;
    margin: 0;
    padding: 0;
}

body {
    font-family: Verdana, sans-serif;
}

/* 月份和年份样式 */
.month {
    padding: 70px 25px;
    width: 100%;
    background: #1abc9c;
}

.month ul li {
    color: white;
    font-size: 20px;
    text-transform: uppercase;
    letter-spacing: 3px;
}

/* 星期样式 */
.weekdays {
    background-color: #ddd;
}

.weekdays li {
    display: inline-block;
    width: 13.6%;
    color: #666;
    text-align: center;
}

/* 日期样式 */
.days {
    background: #eee;
}

.days li {
    display: inline-block;
    width: 13.6%;
    text-align: center;
    margin-bottom: 5px;
    font-size: 12px;
    color: #777;
}

/* 当前日期样式 */
.days li .active {
    padding: 5px;
    background: #1abc9c;
    color: white !important;
}
```

## 3. 响应式设计

为了使日历在不同设备上都能良好展示，我们将使用CSS的媒体查询来调整小屏幕设备上的布局。

```css
@media screen and (max-width: 720px) {
    .weekdays li,
    .days li {
        width: 13.1%;
    }
}

@media screen and (max-width: 420px) {
    .weekdays li,
    .days li {
        width: 12.5%;
    }

    .days li .active {
        padding: 2px;
    }
}

@media screen and (max-width: 290px) {
    .weekdays li,
    .days li {
        width: 12.2%;
    }
}
```

## 4. 完善日历功能

```js
document.addEventListener('DOMContentLoaded', function () {
            var days = document.querySelectorAll('.days li span');
            days.forEach(function (day) {
                day.addEventListener('click', function () {
                    console.log('Date clicked');
                    // 移除其他日期的激活状态
                    days.forEach(function (el) {
                        el.classList.remove('active');
                    });
                    // 为被点击的日期添加激活状态
                    this.classList.add('active');
                });
            });
        });
        // 1. contextmenu 可以禁用右键菜单
        document.addEventListener('contextmenu', function (e) {
            e.preventDefault();
        })
        // 2. 禁止选中文字 selectstart
        document.addEventListener('selectstart', function (e) {
            e.preventDefault();
        })
```

为了使日历更加实用，我们可以添加一些交互功能，例如点击月份和年份切换视图，以及点击日期弹出事件详情。这将需要使用JavaScript来实现，但在本教程中，我们专注于使用CSS创建样式。



## 5. 全部代码



```html
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CSS 日历样式</title>
    <style>
        * {
            box-sizing: border-box;
        }

        ul {
            list-style-type: none;
        }

        body {
            font-family: Verdana, sans-serif;
        }

        .month {
            padding: 70px 25px;
            width: 100%;
            background: #1abc9c;
        }

        .month ul {
            margin: 0;
            padding: 0;
        }

        .month ul li {
            color: white;
            font-size: 20px;
            text-transform: uppercase;
            letter-spacing: 3px;
        }

        .month .prev {
            float: left;
            padding-top: 10px;
        }

        .month .next {
            float: right;
            padding-top: 10px;
        }

        .weekdays {
            margin: 0;
            padding: 10px 0;
            background-color: #ddd;
        }

        .weekdays li {
            display: inline-block;
            width: 13.6%;
            color: #666;
            text-align: center;
        }

        .days {
            padding: 10px 0;
            background: #eee;
            margin: 0;
        }

        .days li {
            list-style-type: none;
            display: inline-block;
            width: 13.6%;
            text-align: center;
            margin-bottom: 5px;
            font-size: 12px;
            color: #777;
        }

        .days li .active {
            padding: 5px;
            background: #1abc9c;
            color: white !important
        }

        /* Add media queries for smaller screens */
        @media screen and (max-width:720px) {

            .weekdays li,
            .days li {
                width: 13.1%;
            }
        }

        @media screen and (max-width: 420px) {

            .weekdays li,
            .days li {
                width: 12.5%;
            }

            .days li .active {
                padding: 2px;
            }
        }

        @media screen and (max-width: 290px) {

            .weekdays li,
            .days li {
                width: 12.2%;
            }
        }
    </style>
</head>

<body>

    <h1 style="text-align: center;">CSS 日历</h1>

    <div class="month">
        <ul>
            <li class="prev">❮</li>
            <li class="next">❯</li>
            <li style="text-align:center">
                March<br>
                <span style="font-size:18px">2024</span>
            </li>
        </ul>
    </div>

    <ul class="weekdays">
        <li>Mo</li>
        <li>Tu</li>
        <li>We</li>
        <li>Th</li>
        <li>Fr</li>
        <li>Sa</li>
        <li>Su</li>
    </ul>

    <ul class="days">
        <li><span>1</span></li>
        <li><span>2</span></li>
        <li><span>3</span></li>
        <li><span>4</span></li>
        <li><span>5</span></li>
        <li><span>6</span></li>
        <li><span>7</span></li>
        <li><span>8</span></li>
        <li><span>9</span></li>
        <li><span class="active">10</span></li>
        <li><span>11</span></li>
        <li><span>12</span></li>
        <li><span>13</span></li>
        <li><span>14</span></li>
        <li><span>15</span></li>
        <li><span>16</span></li>
        <li><span>17</span></li>
        <li><span>18</span></li>
        <li><span>19</span></li>
        <li><span>20</span></li>
        <li><span>21</span></li>
        <li><span>22</span></li>
        <li><span>23</span></li>
        <li><span>24</span></li>
        <li><span>25</span></li>
        <li><span>26</span></li>
        <li><span>27</span></li>
        <li><span>28</span></li>
        <li><span>29</span></li>
        <li><span>30</span></li>
        <li><span>31</span></li>
    </ul>
    <script>
        document.addEventListener('DOMContentLoaded', function () {
            var days = document.querySelectorAll('.days li span');
            days.forEach(function (day) {
                day.addEventListener('click', function () {
                    console.log('Date clicked');
                    // 只有当日期未被激活时才进行操作
                    // 移除其他日期的激活状态
                    days.forEach(function (el) {
                        el.classList.remove('active');
                    });
                    // 为被点击的日期添加激活状态
                    this.classList.add('active');
                });
            });
        });
        // 1. contextmenu 可以禁用右键菜单
        document.addEventListener('contextmenu', function (e) {
            e.preventDefault();
        })
        // 2. 禁止选中文字 selectstart
        document.addEventListener('selectstart', function (e) {
            e.preventDefault();
        })
    </script>
</body>

</html>
```
