let app=new Vue({
    el:'#app',
    data:{
        formData:{
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
        unmodifiable: true,
        fullScreenLoading:false,
        currentUserId:"997dbab0ddf8403d8ab0b4e243454222",
        loading:false,
        buttonText:'修改信息',
        exitButton:{
            visible:false
        },
        urls:{
            getUserInfo: serverUrl + "/api/sys/user/getUserInfo",
            updateUserInfo : serverUrl + "/api/sys/user/updateUserInfo"
        }
    },
    methods:{
        modify:function () {
            // console.log('in')
            let app = this
            if (app.unmodifiable){
                app.unmodifiable = false
                app.buttonText = '保存修改'
                app.exitButton.visible = true
            }else{
                console.log('123')
                app.loading = true
                let data = app.formData
                ajaxPostJSON(app.urls.updateUserInfo, data, function (d) {
                    console.log(d)
                    // app.loading = false;
                    app.$message({
                        message: '修改成功',
                        type: 'success'
                    });
                    app.exit()
                }, function (e) {
                    console.log(e)
                    app.loading = false;
                    app.$message({
                        message: '修改失败',
                        type: 'error'
                    });
                    app.loading = false
                });
            }

        },
        exit:function (){
            this.unmodifiable = true
            this.buttonText = '修改信息'
            this.exitButton.visible = !this.exitButton.visible
            this.getUserInfo()
        },
        getUserInfo:function () {
            let app=this
            let data={
                id:app.currentUserId
            }
            ajaxPostJSON(app.urls.getUserInfo, data, function (d) {
                console.log(d)
                app.fullScreenLoading = false;
                app.formData = d.data[0]
            },function (d) {
                app.fullScreenLoading = false;
                app.$message.error('获取失败，请重试' + d.message, 'warning');

            })
        }
    },
    created:function () {
        // this.auth.userInfo = HSON.parse(getSessionStorage('user'))
        // if (this.aut.userInfo == null){
        //     this.$message({
        //         message:'请登录',
        //         type:'error'
        //     });
        //     return
        // }
        // if (this.auth.userInfo.role === 'student'){
        //     this.auth.showWindow = true
        //     return
        // }
        // this.$message({
        //     message: "您无权访问该页面",
        //     type:'error'
        // });
        //权限验证
        //页面初始化（数据加载）
        this.getUserInfo()

    }
})