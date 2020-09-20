let app = new Vue({
    el: '#app',
    data() {
        let validateUserName = (rule, value, callback) => {
            console.log(value)
            if (value === '') {
                return callback(new Error('请填写准考证号'));
            } else {
                ajaxPost(this.urls.isNameUsed, {'username': value},
                    function (result) {
                        if (result.data)
                            return callback(new Error('该准考证已注册'));
                        else
                            callback()
                    },
                    function () {
                        return callback(new Error('未知错误，请稍后再试'));
                    })
            }
        };
        let validateEmail = (rule, value, callback) => {
            if (value === '') {
                return callback(new Error('请填写邮箱'));
            } else if (!/^([a-zA-Z\d])(\w|-)+@[a-zA-Z\d]+\.[a-zA-Z]{2,4}$/.test(value)) {
                return callback(new Error('邮箱不合法，请重新输入'));
            } else {
                callback();
            }
        };
        let validateConfirmPassword = (rule, value, callback) => {
            if (value === '') {
                return callback(new Error('请再次输入密码'));
            } else if (value !== this.ruleForm.password) {
                return callback(new Error('两次输入密码不一致'));
            } else {
                callback();
            }
        };
        return {
            urls: {
                login: serverUrl + '/api/sys/user/login',
                register: serverUrl + '/api/sys/user/register',
                isNameUsed: serverUrl + '/api/sys/user/isNameUsed'
            },
            activeName: 'login',
            ruleForm: {
                userName: '',
                password: '',
                confirmPassword: '',
                email: '',
            },
            fullScreenLoading: false,
            rules: {
                email: [{required: true, trigger: 'blur', validator: validateEmail}],
                userName: [{required: true, trigger: 'blur', validator: validateUserName}],
                password: [{required: true, trigger: 'blur', message: '请填写密码'}],
                confirmPassword: [{required: true, trigger: 'blur', validator: validateConfirmPassword}],
            }
        }
    },
    methods: {
        login: function () {
            let app = this;
            let data = {
                username: app.ruleForm.userName,
                password: app.ruleForm.password
            }
            app.fullScreenLoading = true;
            ajaxPostJSON(
                app.urls.login,
                data,
                function (result) {
                    app.fullScreenLoading = false;
                    if (result.code === 'success') {
                        if (typeof result.data === 'object') {
                            app.$message({
                                message: '登录成功',
                                type: 'success'
                            });
                            setSessionStorage('user', JSON.stringify(result.data))
                            setTimeout(function () {
                                window.open("./frame.html", "_self")
                            }, 2000);
                        } else {
                            app.$message({
                                message: '用户名或密码错误',
                                type: 'error'
                            });
                        }
                    } else {
                        app.$message({
                            message: '服务器错误，原因\n' + result.data,
                            type: 'error'
                        });
                    }
                },
                function () {
                    app.fullScreenLoading = false;
                    app.$message({
                        message: '未知错误',
                        type: 'error'
                    });
                })
        },
        register: function () {
            let app = this;
            app.$refs['ruleForm'].validate((valid) => {
                if (valid) {
                    let data = {
                        username: this.ruleForm.userName,
                        password: this.ruleForm.password,
                        email: this.ruleForm.email
                    }
                    app.fullScreenLoading = true;
                    ajaxPostJSON(
                        app.urls.register,
                        data,
                        function (result) {
                            app.fullScreenLoading = false;
                            if (result.code === 'success') {
                                if (result.data === true) {
                                    app.$message({
                                        message: '注册成功',
                                        type: 'success'
                                    });
                                    app.activeName = 'login'
                                } else
                                    app.$message({
                                        message: '注册失败',
                                        type: 'error'
                                    });
                            } else
                                app.$message({
                                    message: '服务器错误，原因\n' + result.data,
                                    type: 'error'
                                });
                        },
                        function () {
                            app.fullScreenLoading = false;
                            app.$message({
                                message: '未知错误',
                                type: 'error'
                            });
                        }
                    )
                } else {
                    app.$message({
                        message: '请按提示完善信息',
                        type: 'error'
                    });
                    return false;
                }
            })
        },
        handleTabClick: function () {
            this.ruleForm.userName = '';
            this.ruleForm.password = '';
            this.ruleForm.confirmPassword = '';
            this.ruleForm.email = '';
            this.$refs['ruleForm'].clearValidate();
        },
    },
    created: function () {
        if (getSessionStorage('user') !== null) {
            this.$message({
                message: "您已登录，将跳转到首页",
                type: 'error'
            });
            setTimeout(function () {
                window.open("./frame.html", "_self")
            }, 2000);
        }
    }
})