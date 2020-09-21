
let app = new Vue({
    el: '#app',
    data: {
        urls: {
            getUserList: serverUrl + "/api/sys/user/getUser",
            getUserInfo: serverUrl + "/api/sys/user/getUserInfo",
            putUser: serverUrl + '/api/sys/user/put',
            updateUser: serverUrl + '/api/sys/user/updateUser',
            deleteUserList: serverUrl + '/api/sys/user/deleteUserByIds',
            addUser: serverUrl + '/api/sys/user/addUser',
            // getAllRoleList: serverUrl + '/api/sys/role/selectAllList',
            updateUserRole: serverUrl + '/api/sys/map/userRole/update',
            initUser: serverUrl + '/api/sys/user/initUser',
            getSchoolList: serverUrl + '/api/sys/user/getSchoolList',
            getMajorList: serverUrl + '/api/sys/user/getMajorList'
        },
        fullScreenLoading: false,
        table: {
            data: [{
                // username:'yuzhenjie',
                // role:'考生',
                // password:'123456',
                // createdTime:'2020-01-01',
                // lastLoginTime:'2020-01-01'
            }],
            loading: false,
            selectionList: [],
            params: {
                id : '',
                page:{
                    pageIndex: 1,
                    pageSize: 10,
                    pageSizes: [5, 10, 20, 40],
                    searchKey: '',  // 搜索词
                    total: 2,       // 总数
                },

                role: ''
            }
        },
        draw:{
            data:{
                name:'',
                admission_number:'',
                contact:'',
                alternate_contact:'',
                type:'',
                student_name:'',
                province:'',
                city:'',
                address:'',
                high_school:'',
                major:'',
                fractional_segment:'',
                ranking_section:'',
                qiangji_plan:'',
                tiqianpi:'',
                signed:'',
                year:'',
                subject:'',
                model:''
            },
            visible:false,
            direction:'ltr'
        }
        ,
        dialog: {
            insertOrUpdate: {
                visible: false,
                loading: false,
                formData: {
                    username: '',
                    password: '',
                    role: ''
                },
                rules: {
                    username: [
                        {validator: validateUsername, trigger: 'blur'},
                        {validator: validateUsername, trigger: 'change'},
                    ],
                    password: [
                        {required: true, message: '密码不能为空', trigger: 'blur'},
                        {required: true, message: '密码不能为空', trigger: 'change'},
                    ],
                    nothing: [
                        {required: true, message: '密码不能为空', trigger: 'blur'},
                    ]
                },
                status: '', // insert or update
                roleList: [
                    {label: '管理员', value: 'admin'},
                    {label: '招生组组长', value: 'leader'},
                    {label: '招生老师', value: 'teacher'},
                    {label: '访客', value: 'student'}
                ],
                schoolList: [],
                majorList: []
            },
            mapRole: {
                visible: false,
                loading: false,
                currentUser: null
            }
        },
        roleTree: [],
        options: {
            role: [
                {label: '全部', value: ''},
                {label: '管理员', value: 'admin'},
                {label: '招生组组长', value: 'leader'},
                {label: '招生老师', value: 'teacher'},
                {label: '访客', value: 'student'}

            ]
        },
        selectUser:{
            username:'',
            password:''
        }
    },
    methods: {
        // 处理选中的行变化
        handleSelectionChange: function (val) {
            this.table.selectionList = val;
        },
        // 处理pageSize变化
        handleSizeChange: function (newSize) {
            this.table.params.pageSize = newSize;
            this.getUserList();
        },
        // 处理pageIndex变化
        handleCurrentChange: function (newIndex) {
            this.table.params.pageIndex = newIndex;
            this.getUserList();
        },
        // 刷新table的数据
        getUserList: function () {
            let data = {
                page: this.table.params,
                role: this.table.params.role
            };
            let app = this;
            this.table.loading = true;
            // console.log(;asdfhjkas)
            ajaxPostJSON(this.urls.getUserList, data, function (d) {
                console.log(d)
                app.table.loading = false;
                app.table.data = d.data;
                app.table.params.total = d.data.length;
            }, function () {
                app.table.loading = false;
                app.$message.error('查找失败！' , 'error');
            });
        },
        // 重置表单
        resetForm: function (ref) {
            this.$refs[ref].resetFields();
        },
        // 删除指定id的用户
        deleteUser: function (val, type = 'multi') {
            // 未选中任何用户的情况下点选批量删除
            if (type === 'multi' && val.length == 0) {
                app.$message.error('提示：未选中任何用户', 'warning');
                return;
            }
            this.$confirm('确认删除选中的用户', '警告', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                let idList = [];
                if (type === 'single') {
                    let id = val;
                    idList.push({
                        id: id
                    });
                } else {
                    let selectionList = val;
                    for (let i = 0; i < selectionList.length; i++) {
                        idList.push({
                            id: selectionList[i].id
                        });
                    }
                }
                let data = idList;
                let app = this;
                app.fullScreenLoading = true;
                console.log(data)
                ajaxPostJSON(app.urls.deleteUserList, data, function (d) {
                    app.fullScreenLoading = false;
                    app.$message.error('删除成功！', 'success');
                    // if (app.table.data.length === 1 && app.table.params.pageIndex > 0)
                    //     app.table.params.pageIndex -= 1;
                    app.getUserList();
                },function (d) {
                    app.fullScreenLoading = false;
                    app.$message.error('操作失败，请重试' + d.message, 'warning');

                })
            }).catch(() => {
                this.$message.error('已取消删除', 'warning');
            });
            // app.fullScreenLoading = false;

        },
        // 打开详细信息
        getUserInfo: function (user) {
            this.draw.visible = true
            this.selectUser.username = user.username
            this.selectUser.password = user.password
            let app = this;
            let userid = user.id
            let data = {
                id: userid
            }
            ajaxPostJSON(app.urls.getUserInfo, data, function (d) {
                console.log(d)
                app.fullScreenLoading = false;
                app.draw.data = d.data[0]
                // app.$message.error('删除成功！', 'success');
                // if (app.table.data.length === 1 && app.table.params.pageIndex > 0)
                //     app.table.params.pageIndex -= 1;
                // app.getUserList();
            },function (d) {
                app.fullScreenLoading = false;
                app.$message.error('查询失败，请重试' + d.message, 'warning');

            })

        },
        // 更新用户和角色的关联
        updateUserRole: function () {
            let app = this;
            let data = copy(app.dialog.mapRole.currentUser);
            data.roleList = [];
            let idList = app.$refs.tree.getCheckedKeys();
            for (let i = 0; i < idList.length; i++) {
                data.roleList.push({id: idList[i]});
            }
            app.dialog.mapRole.loading = true;
            ajaxPostJSON(app.urls.updateUserRole, data, function (d) {
                app.dialog.mapRole.loading = false;
                app.$message.error('保存成功!');
            })
        },
        // 打开添加用户窗口
        openInsert: function () {
            this.dialog.insertOrUpdate.visible = true;
            this.dialog.insertOrUpdate.status = 'insert';
            this.resetDialog();
        },
        // 打开编辑用户窗口
        openUpdate: function (user) {
            // console.log('user',user)
            this.dialog.insertOrUpdate.visible = true;
            this.dialog.insertOrUpdate.status = 'update';
            this.dialog.insertOrUpdate.formData = copy(user);
        },
        // 添加或编辑用户信息
        insertOrUpdate: function () {
            this.$refs['form_insertOrUpdate'].validate((valid) => {
                if (valid) {
                    let data = copy(this.dialog.insertOrUpdate.formData);
                    console.log('xiugaihou',data)
                    let app = this;
                    let url = app.dialog.insertOrUpdate.status === 'insert' ? app.urls.addUser : app.urls.updateUser;
                    app.dialog.insertOrUpdate.loading = true;

                    ajaxPostJSON(url, data, function (d) {
                        app.dialog.insertOrUpdate.loading = false;
                        app.dialog.insertOrUpdate.visible = false;
                        let successMes = app.dialog.insertOrUpdate.status === 'insert' ? '添加成功!' : '编辑成功!';
                        app.$message.error(successMes, 'success');
                        app.getUserList(); // 添加完成后刷新页面
                    }, function () {
                        app.dialog.insertOrUpdate.loading = false;
                        app.dialog.insertOrUpdate.visible = false;
                        let errorMes = app.dialog.insertOrUpdate.status === 'insert' ? '添加失败!' : '编辑失败!';
                        app.$message.error(errorMes, 'error');
                    });
                } else {
                    console.log("表单数据不合法！");
                    return false;
                }
            });
            // let data = this.dialog.insertOrUpdate.formData;
        },

        initUser: function () {
            let app = this;
            window.parent.app.showConfirm(() => {
                app.fullScreenLoading = true;
                ajaxPost(app.urls.initUser, null, function () {
                    app.fullScreenLoading = false;
                    app.$message.error('初始化成功！', 'success');
                }, function (d) {
                    app.fullScreenLoading = false;
                    app.$message.error('操作失败，请重试\n' + d.message, 'error');
                })
            });
        },

        resetDialog: function () {
            console.log('resetDialog被打开了')
            this.dialog.insertOrUpdate.formData.username = '';
            this.dialog.insertOrUpdate.formData.password = '';
            this.dialog.insertOrUpdate.formData.role = '';
            this.dialog.insertOrUpdate.formData.email = '';


        }
    },
    mounted: function () {
        // 获取角色列表
        let data = null;
        let app = this;
        app.fullScreenLoading = true;

        app.getUserList();


        app.fullScreenLoading = false;
    }
});

/**
 * 验证用户名
 * @param rule
 * @param value
 * @param callback
 */
function validateUsername(rule, value, callback) {
    let url = '/api/sys/user/checkUsername';
    let data = {
        username: value
    };
    if (value == null || value.length === 0) {
        callback(new Error('用户名不能为空'));
        return;
    }
    ajaxPostJSON(url, data, function (d) {
        if (d.code === 'error') {
            callback(new Error('用户名已被注册'));
            callback(new Error('用户名已被注册'));
        } else {
            callback();
        }
    })
}