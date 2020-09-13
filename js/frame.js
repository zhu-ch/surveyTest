/**
 * @author zch
 * @description 整体显示框架，各页面用iframe嵌入el-main
 * */

//标签名称、url
let urls = [
    ['null','null'],
    ['null','null'],
    ['数据导入管理', 'management/ExcelManage.html'],
    ['涉密计算机', 'computer/confidentialComputer.html'],
    ['非涉密中间机', 'computer/nonConfidentialIntermediary.html'],
    ['非涉密计算机', 'computer/nonConfidentialComputer.html'],
    ['报废计算机', 'computer/scrappedComputer.html'],
    ['涉密信息设备', 'informationDevice/confidentialInfoDevice.html'],
    ['非涉密信息设备', 'informationDevice/nonConfidentialInfoDevice.html'],
    ['报废信息设备', 'informationDevice/scrappedInfoDevice.html'],
    ['涉密存储介质', 'storage/confidentialStorage.html'],
    ['非涉密存储介质', 'storage/nonConfidentialStorage.html'],
    ['报废涉密存储介质', 'storage/scrappedStorage.html'],
    ['安全保密产品', 'securityProduct/securityProducts.html'],
    ['报废安全保密产品', 'securityProduct/scrappedSecurityProducts.html'],
    ['USB Key', 'usb/usb.html'],
    ['报废USB Key', 'usb/scrappedUSB.html']
];

let app = new Vue({
    el: '#app',
    data: {
        showWindow: false,
        default_openeds_array: [
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
        setSessionStorage('user','aaa')
        this.checkStatus();
    },
    methods: {
        //判断登录状态
        checkStatus() {
            if (getSessionStorage('user') != null) {
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
        logout:function () {
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
        }
    }
});