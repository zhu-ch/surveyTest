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
        info:{
            provinces:[],
            highSchools:[],
            majors:[],
            models:[]
        },
        unmodifiable: true,
        fullScreenLoading:false,
        currentUserId:"5b22a4cd129e470ca7d41d9095b7e5bf",
        loading:false,
        buttonText:'修改信息',
        exitButton:{
            visible:false
        },

        urls:{
            getUserInfo: serverUrl + "/api/sys/user/getUserInfo",
            updateUserInfo : serverUrl + "/api/sys/user/updateUserInfo",
            selectDictListByPage:serverUrl + "/api/sys/dict/selectDictListByPage"
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
                app.getHighSchool(app.formData.province)
            },function (d) {
                app.fullScreenLoading = false;
                app.$message.error('获取失败，请重试' + d.message, 'warning');

            })
        },
        getProvinces:function (){
            console.log('getProvince')
            let app = this
            let params = {
                pageIndex: 1,
                pageSize: 100,
                pageSizes: [5, 10, 20, 40, 100],
                searchKey: '',  // 搜索词
                total: 0,       // 总数
            }
            let data = {
                dicProperty: '省份',
                page:params
            }

            app.fullScreenLoading = true;
            ajaxPostJSON(app.urls.selectDictListByPage, data, function (d) {
                console.log(d)
                app.fullScreenLoading = false;
                let provinceList = []
                // resultList = d.data(
                for (i in d.data.resultList){
                    provinceList[i] = d.data.resultList[i]['dicValue']
                }
                app.info.provinces = provinceList
            },function (d) {
                app.fullScreenLoading = false;
                app.$message.error('获取失败，请重试' + d.message, 'warning');

            })
        },
        getMajors:function (){
            console.log('getMajors')
            let app = this
            let params = {
                pageIndex: 1,
                pageSize: 100,
                pageSizes: [5, 10, 20, 40, 100],
                searchKey: '',  // 搜索词
                total: 0,       // 总数
            }
            let data = {
                dicProperty: '专业',
                page:params
            }

            app.fullScreenLoading = true;
            ajaxPostJSON(app.urls.selectDictListByPage, data, function (d) {
                console.log(d)
                app.fullScreenLoading = false;
                let majorList = []
                // resultList = d.data(
                for (i in d.data.resultList){
                    majorList[i] = d.data.resultList[i]['dicValue']
                }
                app.info.majors = majorList
            },function (d) {
                app.fullScreenLoading = false;
                app.$message.error('获取失败，请重试' + d.message, 'warning');

            })
        },
        getModels:function (){
            console.log('getModels')
            let app = this
            let params = {
                pageIndex: 1,
                pageSize: 100,
                pageSizes: [5, 10, 20, 40, 100],
                searchKey: '',  // 搜索词
                total: 0,       // 总数
            }
            let data = {
                dicProperty: '高考模式',
                page:params
            }

            app.fullScreenLoading = true;
            ajaxPostJSON(app.urls.selectDictListByPage, data, function (d) {
                console.log(d)
                app.fullScreenLoading = false;
                let modelList = []
                // resultList = d.data(
                for (i in d.data.resultList){
                    modelList[i] = d.data.resultList[i]['dicValue']
                }
                app.info.models = modelList
            },function (d) {
                app.fullScreenLoading = false;
                app.$message.error('获取失败，请重试' + d.message, 'warning');

            })
        },
        getHighSchool:function (province){
            console.log('getHighSchool')

            let app = this
            let params = {
                pageIndex: 1,
                pageSize: 100,
                pageSizes: [5, 10, 20, 40, 100],
                searchKey: '',  // 搜索词
                total: 0,       // 总数
            }
            let data = {
                father:province,
                page:params
            }
            app.fullScreenLoading = true;
            ajaxPostJSON(app.urls.selectDictListByPage, data, function (d) {
                console.log(d)
                app.fullScreenLoading = false;
                app.info.highSchools = d.data
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
        this.getProvinces()
        this.getMajors()
        this.getModels()


    }
})