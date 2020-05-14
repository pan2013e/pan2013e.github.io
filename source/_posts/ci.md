---
title: GitHub CI/CD在本博客中的实践
tags: 
 - GitHub
category: CS
---

最近几天发现原来在服务器上搭建的Wordpress博客突然挂了，使用网站和数据库的备份后还是不能恢复正常，于是决定
更换博客平台，重新用回了Hexo.

<!--more-->
本文需要一定的`linux`, `git`使用经验。

# Hexo存在的问题
Hexo的用法很简单，在官网[hexo.io](https://hexo.io)上也能查到文档。
主要流程就是

```bash
$ hexo clean
$ hexo generate
$ hexo deploy
```

执行一遍后,hexo就会生成相关网页文件，然后推送到GitHub的repo上。但一个小问题是，这样的工作流对于跨设备的内容创作者来说，还不够便捷。

首先我们需要在机器上配置`nodejs`环境，然后用`npm`安装`hexo-cli`。

同时，`hexo`上传的只是网页及其依赖文件，因此要进行版本控制，除了`deploy`命令，我们还需要将源代码同步到某一个分支或仓库。

`hexo`已经帮我解决很多问题了，包括网页的设计和布局，`markdown`格式也解决了文字排版的问题。但如果能做到在本地只进行内容编辑
，云端自动完成部署，就更好了。

# GitHub Actions
GitHub Actions是GitHub官方的持续集成工具，我原本打算用Travis-CI，后来感觉GitHub Actions更加方便。GitHub Actions的工作, 可以简单地理解为探测到指定指令后触发，开启一个干净的虚拟机来完成此前指定的workflow. 官方文档可以在GitHub查看。

之前我想要做的是，本地环境中不渲染网页，将所有源代码push到repo后，网页部署自动完成。那么我的`.github/workflows/CI.yml`设置如下

```bash
name: Hexo Auto-Deploy
on: [push]

jobs:
  build:
    name: Hexo Auto-Deploy by GitHub Actions
    runs-on: ubuntu-latest

    steps:
    - name: 1. git checkout...
      uses: actions/checkout@master
      
    - name: 2. setup nodejs...
      uses: actions/setup-node@master
    
    - name: 3. install hexo...
      run: |
        npm install hexo-cli -g
        npm install
        
    - name: 4. hexo generate public files...
      run: |
        hexo clean
        hexo g  

    - name: 5. hexo deploy ...
      run: |
        mkdir -p ~/.ssh/
        echo "${{ secrets.DEPLOY_KEY }}" > ~/.ssh/id_rsa
        chmod 600 ~/.ssh/id_rsa
        ssh-keyscan github.com >> ~/.ssh/known_hosts
        
        git config --global user.name "Zhiyuan Pan"
        git config --global user.email "zy_pan@zju.edu.cn"
        git config --global core.quotepath false

        hexo d
```
可以看到,Hexo Auto-Deploy的钩子被push操作唤醒，开启了一个Ubuntu虚拟机，安装了依赖程序（因为是干净的虚拟机，每次启动都需要完成配置），分5个步骤进行了原本应该在本地执行的命令。为了保护源代码文件，它们被推送到`blog-source`分支，而可以看到，网页被部署到了`master`分支。

需要注意的是，为了让Actions获得读写权限，需要事先在本地生成一对密钥，将公钥添加到个人设置中的SSH keys中，将私钥添加到该repo设置中的Secrets中。上面的`DEPLOY_KEY`就是私钥的变量名。

配置完成后，我只需要在本地编写`markdown`文件，就可以了。

实际上，绝大多数基于`php`的动态博客都能在网站后台进行各种操作，比我的操作更快，对用户更友好。可能，最大的乐趣就在于折腾本身吧。