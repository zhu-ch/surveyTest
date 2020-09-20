let app = new Vue({
    el: '#app',
    data: {
        user: {},
        urls: {
            // api for entity
            insertEntity: serverUrl + '/api/sys/dict/insertOrUpdateDict',
            deleteEntityListByIds: serverUrl + '/api/sys/dict/deleteDictByIds',
            updateEntity: serverUrl + '/api/sys/dict/insertOrUpdateDict',
            selectEntityListByPage: serverUrl + '/api/sys/dict/selectDictListByPage',
            // api for dictType
            selectDictTypeAllList: serverUrl + '/api/sys/dict/getDictTypeList'
        },
        fullScreenLoading: false,
        table: {
            entity: {
                data: [],
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
        dialog: {
            insertEntity: {
                visible: false,
                loading: false,
                formData: {
                    dicValue: '',
                    dicProperty: '',
                    sort: 0,
                    remark: '',
                    delFlag: 0
                },
                rules: {},
            },
            updateEntity: {
                visible: false,
                loading: false,
                formData: {},
                rules: {},
            }
        },
        options: {
            dict: [],
            loading_dict: false,
            dictType: []
        },
    },
    methods: {
        refreshTableEntity: function () {
            this.selectEntityListByPage();
        },
        selectEntityListByPage: function () {
            let data = copy(this.table.entity.condition);
            data.page = this.table.entity.params;
            let app = this;
            app.table.entity.loading = true;
            ajaxPostJSON(this.urls.selectEntityListByPage, data, function (d) {
                app.table.entity.loading = false;
                app.table.entity.data = d.data.resultList;
                app.table.entity.params.total = d.data.total;
            }, function () {
                app.table.entity.loading = false;
                app.$message({
                    message: '未知错误',
                    type: 'error'
                });
            });
        },
        insertEntity: function () {
            // 首先检测表单数据是否合法
            this.$refs['insert'].validate((valid) => {
                if (valid) {
                    let data = this.dialog.insertEntity.formData;
                    let app = this;
                    app.dialog.insertEntity.loading = true;
                    ajaxPostJSON(app.urls.insertEntity, data, function (d) {
                        app.dialog.insertEntity.loading = false;
                        app.dialog.insertEntity.visible = false;
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
                        app.dialog.insertEntity.loading = false;
                        app.dialog.insertEntity.visible = false;
                        app.$message({
                            message: '未知错误',
                            type: 'error'
                        });
                    });
                } else {
                    app.$message({
                        message: '表单数据不合法！',
                        type: 'error'
                    });
                    return false;
                }
            });
        },
        updateEntity: function () {
            // 首先检测表单数据是否合法
            this.$refs['update'].validate((valid) => {
                if (valid) {
                    let data = this.dialog.updateEntity.formData;
                    let app = this;
                    app.dialog.updateEntity.loading = true;
                    ajaxPostJSON(app.urls.updateEntity, data, function (d) {
                        app.dialog.updateEntity.loading = false;
                        app.dialog.updateEntity.visible = false;
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
                        app.dialog.updateEntity.loading = false;
                        app.dialog.updateEntity.visible = false;
                        app.$message({
                            message: '未知错误',
                            type: 'error'
                        });
                    });
                } else {
                    app.$message({
                        message: '表单数据不合法！',
                        type: 'error'
                    });
                    return false;
                }
            });
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
                ajaxPostJSON(this.urls.deleteEntityListByIds, data, function (d) {
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
        openUpdateDialog: function (row) {
            this.dialog.updateEntity.visible = true;
            this.dialog.updateEntity.formData = copy(row);
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
        // 重置表单
        resetForm: function (ref) {
            this.$refs[ref].resetFields();
        },
    },
    created: function () {
        let app = this;
        app.user = getSessionStorage('user')
        //todo 权限验证

        ajaxGet(this.urls.selectDictTypeAllList, null, function (d) {
            app.options.dictType = d.data;
            app.refreshTableEntity();
        })
    }
})