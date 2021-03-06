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
    ['历史问卷', 'survey-historySurveys.html'],
    //不直接展示
    ['问卷预览', 'survey-surveyPreview.html'],
    ['问卷填写', 'survey-fillInSurvey.html'],
    ['问卷信息', 'statistic-detail.html'],
    ['答卷概览', 'statistic-overall.html']

];

let app = new Vue({
    el: '#app',
    data: {
        user: {},
        iframeWin: {},
        showWindow: false,
        default_open_array: [
            'management'
        ],
        tabList: [
            {
                url: '../admission/admission.html',
                title: '北京理工大学本科招生网',
                name: 'tab0',
                loading: true // tab页进入加载状态
            }
        ],
        activeTabName: 'tab0',
        tabNameCount: 1, // 只增不减
        fullScreenLoading: false
    },
    created: function () {
        this.checkStatus()
    },
    methods: {
        //判断登录状态
        checkStatus(){
            this.user = JSON.parse(getSessionStorage('user'))
            if (this.user != null) {
                this.showWindow = true
                if (getSessionStorage("fill-in-survey-id") != null) {
                    this.addTab("问卷填写", "survey-fillInSurvey.html")
                }
                return;
            }
            this.$message({
                message: "请登录",
                type: 'error'
            });
            console.log(window.location.search)
            var tmp_str = window.location.search.substring(1, window.location.search.length)
            var arr = tmp_str.split("&")
            var object = new Object()
            for (var i = 0; i < arr.length; i++) {
                var tmp_arr = arr[i].split("=");
                object[decodeURIComponent(tmp_arr[0])] = decodeURIComponent(tmp_arr[1]);
            }



            var surveyId = object["surveyId"]
            if (surveyId != null)
                setSessionStorage("fill-in-survey-id", surveyId)
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
        handleMessage: function (event) {
            const data = event.data.data
            if (data && data.type == "addTabSurveyPreview") {
                setSessionStorage("fill-in-survey-id", data.params[0])
                this.addTab(data.title + " - 问卷预览", "survey-surveyPreview.html")
                setSessionStorage("fill-in-survey-id", data.params[0])
            } else if (data && data.type == "addTabCreateSurvey") {
                this.addTab('创建问卷', 'survey-createSurvey.html')
            } else if (data && data.type == 'addTabDetail') {
                setSessionStorage("detail-survey-id", data.params[0])
                this.addTab(data.title + " - 问卷信息", "statistic-detail.html")
            } else if (data && data.type == 'addTabOverall') {
                setSessionStorage("overall-survey-id", data.params[0])
                this.addTab(data.title + " - 答卷概览", "statistic-overall.html")
            } else if (data && data.type == 'closeCreateSurvey') {
                this.removeTab(this.activeTabName)
            } else if (data && data.type == 'addSurveyManagement') {
                this.addTab("问卷管理", "survey-surveyManagement.html")
            } else if (data && data.type == 'addTabSurveyOverview') {
                setSessionStorage("overview-survey-id", data.params[0])
                setSessionStorage("overview-respondent-id", JSON.parse(getSessionStorage("user")).id)
                this.addTab(data.title + " - 问卷回顾", "survey-surveyOverview.html")
            }
        }
    },

    mounted: function () {
        window.addEventListener('message', this.handleMessage);
        this.iframeWin = this.$refs.iframe.contentWindow;
    }
});