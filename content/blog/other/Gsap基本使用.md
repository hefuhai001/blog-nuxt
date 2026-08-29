# Gsap基本使用



## 1. 下载

```bat
// power shell
npm i gsap 
```

## 2.导入

```js
//main.js
import { gsap } from "gsap";
```

## 3.编写配置文件

```js
// vue.config.js
const path = require('path');

module.exports = {
	chainWebpack: config => {
		config.resolve.alias.set('gsap', path.resolve(__dirname, 'node_modules', 'gsap')); // 设置GSAP别名
	}
};

```

## 4.使用gsap

```js
import { gsap } from "gsap";

export const flow =()=>{
    gsap.set(".flow",{
        y:"-20px",
    });
	gsap.to(".form", {
		y: '0',
		duration: 1,
		repeat: -1,
		yoyo: true,
		ease: "power1.inOut"
	});
}
```

## 5.全部代码

```vue
<template>
	<view class="main">
		<view class="flow form">
			<input type="text" placeholder="账号" v-model="user.acc">
			<input type="text" placeholder="密码" v-model="user.pwd">
			<button size="mini" type="default" @click="loginIn">登录</button>
			<button size="mini" type="default" @click="reset">取消</button>
		</view>
		<view class="dots">
			<view class="dot"></view>
			<view class="dot"></view>
			<view class="dot"></view>
		</view>

		<view class="bg-container"></view>
	</view>
</template>

<script>
	import {
		flow,
		showMessage
	} from '../../gsap/index.js'
	import {
		$login
	} from '../../api/index.js'
	export default {
		data() {
			return {
				user: {
					acc: '',
					pwd: '',
				}
			}
		},
		mounted() {
			flow();
		},
		methods: {
			async loginIn() {
				if (this.user.acc.length <= 0 || this.user.pwd.length <= 0) {
					showMessage('请输入账号或密码...');
					return;
				}
				let data = await $login(this.user);
				if (data.length >= 1) {
					uni.setStorage({
						key: 'account',
						data: this.user.acc,
						success: (res) => {
							console.log('记录登录+1');
						}
					})
					uni.navigateTo({
						url: '/pages/index/index',
						animationType: 'slide-in-right'
					})
				} else {
					showMessage('账号或密码错误...');
				}
			},
			reset() {
				this.user.acc = '';
				this.user.pwd = '';
			}
		},
		onLoad() {
			uni.getStorage({
				key: 'account',
				success: (res) => {
					if (res.data.length >= 0) {
						uni.navigateTo({
							url: '/pages/index/index',
							animationType: 'slide-in-right'
						})
					}
				}
			})
		},
	}
</script>

<style scoped>
	* {
		--hei: 40px;
	}

	.main {
		width: 100vw;
		height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
	}

	.form {
		width: 70%;
		height: 300px;
		border-radius: 10px;
		border: 4px solid orange;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
		padding: 30px;
		box-shadow: 0px 3px 10px 2px #fff;
	}

	button {
		color: white;
		width: 100%;
		height: var(--hei);
		line-height: var(--hei);
		margin: 10px 0;
		background-color: orange;
		border: none;
	}

	button:active {
		color: white;
		background-color: rgba(255, 165, 0, .4);
	}

	input {
		width: 100%;
		font-size: 14px;
		height: var(--hei);
		margin: 10px 0;
		border: 2px solid orange;
		padding: 0 10px;
		border-radius: 6px;
	}

	.dots {
		width: 40%;
		height: 20px;
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
	}

	.dot {
		width: 20px;
		height: 20px;
		background-color: orange;
		border-radius: 50%;
	}
</style>

```

