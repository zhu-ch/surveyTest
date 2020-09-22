let app = new Vue({
    el: '#app',
    data: {
        user: {},
        showWindow: false,
        urls: {
            getAnswerByConditions: serverUrl + '/api/survey/getAnswerByConditions',
            deleteAnswer: serverUrl + '/api/survey/deleteAnswer',
            getSurveyByConditions : serverUrl + '/api/survey/getSurveyByConditions'
        },
        fullScreenLoading: false,
        table: {
            entity: {
                data: [
                    {
                        id: '1112312321',
                        title: '测试问卷',
                        writeTime: '2020-01-01',
                        mark: ''
                    }
                ],
                loading: false,
                selectionList: [],
                params: {
                    pageIndex: 1,
                    pageSize: 10,
                    pageSizes: [5, 10, 20, 40],
                    searchKey: '',  // 搜索词
                    total: 0,       // 总数
                },
                condition: {
                    dicProperty: '', // 字典类别
                }
            }
        },

    },
    methods: {
        refreshTableEntity: function () {
            this.getAnswerByConditions();
        },
        getAnswerByConditions: function () {
            // let data = copy(this.table.entity.condition);
            let string = getSessionStorage('user')
            let stringInfo = JSON.parse(string)
            let data = {respondentId: stringInfo.id}
            // data.page = app.table.params
            data.page = this.table.entity.params;
            let app = this;
            app.table.entity.loading = true;
            ajaxPostJSON(this.urls.getAnswerByConditions, data, function (d) {
                console.log(d)
                app.table.entity.loading = false;
                let resData = d.data;
                app.table.entity.data = []
                console.log(resData)
                for ( i in resData){
                    app.table.entity.data[i] = {surveyId:resData[i].surveyId}
                    let tempData = {surveyId: resData[i].surveyId}
                    tempData.page = app.table.entity.params
                    ajaxPostJSON(app.urls.getSurveyByConditions, tempData,function (d){
                        app.table.entity.data[i].title = d.data[0].title
                    },function (){},false)
                }

                app.table.entity.params.total = d.data.total;
            }, function () {
                app.table.entity.loading = false;
                app.$message({
                    message: '未知错误',
                    type: 'error'
                });
            },false);
        },

        deleteEntityListByIds: function (val) {
            if (val.length === 0) {
                app.$message({
                    message: '提示：未选中任何项！',
                    type: 'warning'
                });
                return;
            }
            this.$confirm('确认删除选中的项', '警告', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                let data = val;
                let app = this;
                app.fullScreenLoading = true;
                ajaxPostJSON(this.urls.deleteAnswer, data, function (d) {
                    app.fullScreenLoading = false;
                    if (d.code === 'success') {
                        app.$message({
                            message: "操作成功",
                            type: 'success'
                        });
                        app.refreshTableEntity(); // 添加完成后刷新页面
                    } else if (d.code === 'warning')
                        app.$message({
                            message: "操作失败",
                            type: 'error'
                        });
                    else
                        app.$message({
                            message: '服务器错误，原因\n' + d.data,
                            type: 'error'
                        });
                }, function () {
                    app.fullScreenLoading = false;
                    app.$message({
                        message: '未知错误',
                        type: 'error'
                    })
                })
            }).catch(() => {
                app.$message({
                    message: '已取消删除',
                    type: 'warning'
                })
            });
        },

        // 处理选中的行变化
        onSelectionChange: function (val) {
            this.table.entity.selectionList = val;
        },
        // 处理pageSize变化
        onPageSizeChange: function (newSize) {
            this.table.entity.params.pageSize = newSize;
            this.refreshTableEntity();
        },
        // 处理pageIndex变化
        onPageIndexChange: function (newIndex) {
            this.table.entity.params.pageIndex = newIndex;
            this.refreshTableEntity();
        },

    },
    created: function () {
        let app = this;
        app.user = JSON.parse(getSessionStorage('user'))
        if (app.user == null) {
            this.$message({
                message: "请登录",
                type: 'error'
            });
            return
        }
        if (app.user.role !== 'student') {
            this.$message({
                message: "您无权访问当前页面",
                type: 'error'
            });
            return
        }
        app.showWindow = true


        app.refreshTableEntity();
    }
})