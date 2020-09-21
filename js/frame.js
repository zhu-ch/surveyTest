/**
 * @author zch
 * @description 整体显示框架，各页面用iframe嵌入el-main
 * */

//标签名称、url
let urls = [
    ['null', 'null'],
    ['字典管理', 'sys-manageDict.html'],
    ['用户管理', 'sys-userManager.html'],
    ['配置管理', 'sys-configurationManager.html'],
    ['创建问卷', 'survey-createSurvey.html'],
    ['问卷管理', 'survey-surveyManagement.html'],
    //学生可看
    ['信息维护', 'sys-userInformation.html'],
    ['问卷列表', 'student-surveyList.html'],
    ['历史问卷', 'student-historySurvey.html'],
    //不直接展示
    ['问卷预览', 'survey-surveyPreview.html']
];

let app = new Vue({
    el: '#app',
    data: {
        iframeWin:{},
        userInfo: null,
        showWindow: false,
        default_open_array: [
            'management'
        ],
        tabList: [
            {
                url: '../index.html',
                title: '首页',
                name: 'tab0',
                loading: true // tab页进入加载状态
            }
        ],
        activeTabName: 'tab0',
        tabNameCount: 1, // 只增不减
        fullScreenLoading: false
    },
    created: function () {
        this.checkStatus();
    },
    methods: {
        //判断登录状态
        checkStatus() {
            this.userInfo = JSON.parse(getSessionStorage('user'))
            if (this.userInfo != null) {
                this.showWindow = true;
                return;
            }
            this.$message({
                message: "请登录",
                type: 'error'
            });
            setTimeout(function () {
                window.open("welcome.html", "_self")
            }, 2000);
        },
        //选中触发
        onSelect(key) {
            this.addTab(urls[key][0], urls[key][1]);
        },
        addTab: function (title, url) {
            let exist = false;
            let index = -1;
            //判断是否已经有url相同的标签页被打开
            for (let i = 0; i < this.tabList.length; i++) {
                if (this.tabList[i].url === url) {
                    exist = true;
                    index = i;
                    break;
                }
            }
            //标签页已被打开，则不再添加新的标签页，而是设置目标标签页为active
            if (exist === true) {
                this.activeTabName = this.tabList[index].name;
                this.tabList[index].loading = true; // tab页进入加载状态
                this.refreshTab(this.activeTabName, url);
            } else {
                let newTabName = 'tab' + this.tabNameCount;
                this.tabNameCount += 1;
                this.tabList.push({
                    title: title,
                    url: url,
                    name: newTabName,
                    loading: true // tab页进入加载状态
                });
                this.activeTabName = newTabName;
            }
            return this.activeTabName;
        },
        //删除标签页
        removeTab: function (targetName) {
            if (targetName === 'tab0') {
                console.log("首页不能删除!");
                return;
            }
            let tabs = this.tabList;
            let activeName = this.activeTabName;
            if (activeName === targetName) {
                this.tabList.forEach((tab, index) => {
                    if (tab.name === targetName) {
                        let nextTab = tabs[index + 1] || tabs[index - 1];
                        if (nextTab)
                            activeName = nextTab.name;
                    }
                })
            }
            this.activeTabName = activeName;
            this.tabList = tabs.filter(tab => tab.name !== targetName);
        },
        //刷新指定tab的iframe
        refreshTab: function (iframeId, url) {
            // document.getElementById(iframeId).contentWindow.location.reload(true);
            document.getElementById(iframeId).contentWindow.location.href = url;
        },
        logout: function () {
            app.$confirm('确认退出', '警告', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                delSessionStorage('user');
                app.$message({
                    message: '退出成功',
                    type: 'success'
                });
                setTimeout(function () {
                    window.open("welcome.html", "_self");
                }, 2000);
            })
        },
        handleMessage: function(event) {
            const data = event.data.data
            if(data && data.type == "addTabSurveyPreview"){
                this.addTab("问卷预览","survey-surveyPreview.html")
            }
            else if(data && data.type == "addTabCreateSurvey"){
                this.addTab('创建问卷', 'survey-createSurvey.html')
            }
        }
    },
    mounted:function(){
        window.addEventListener('message', this.handleMessage);
        this.iframeWin = this.$refs.iframe.contentWindow;
    }
});