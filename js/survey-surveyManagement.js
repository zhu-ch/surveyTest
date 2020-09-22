let myComponent = Vue.extend({
    props: {
        'survey': {
            type: Object
        }
    },
    template: `
        <el-card style="margin:5px" v-loading="cardloading">
        <div slot="header" >
            <span>
                {{survey.title}}
            </span>
            <span style="float: right">
<!--                <span style="margin-right: 5px">ID:{{survey.id}} </span>-->
                <span style="margin-right: 5px">当前状态:{{survey.enable == true ? "启用" : "停用"}}</span>
                <span style="margin-right: 5px">答卷数量:{{survey.answerNum}}</span>
<!--                todo 答卷数量-->
            </span>
        </div>
        <div>
           <span>
                <el-button @click="clickSurveySituation">
                    <span>问卷信息</span>
                </el-button>
                <el-button @click="clickAnswerSituation">
                    <span>答卷概览</span>
                </el-button>
                <el-button @click="clickPreview">
                    <span>问卷预览</span>
                </el-button>
           </span>
            <span style="float: right">
                 <el-button @click="clickEnable">
                    <span>启用</span>
                </el-button>
                 <el-button @click="clickStop">
                    <span>停用</span>
                </el-button>
                 <el-button @click="clickDelete">
                    <span>删除</span>
                </el-button>
            </span>
        </div>
    </el-card>
    `,
    methods: {
        clickEnable: function () {
            let app = this
            this.survey.enable = true
            console.log("enable")
            this.cardloading = true
            ajaxPostJSON(this.urls.enableSurvey, this.survey, function (d) {
                if (d.code == 'success') {
                    app.cardloading = false
                    app.$message({
                        message: "操作成功",
                        type: 'success',
                    });
                    app.$emit("refresh", "update");
                    app.$emit('qrcode', app.survey.id)
                } else if (d.code == 'warning')
                    app.$message({
                        message: "操作失败",
                        type: 'error'
                    });
                else
                    app.$message({
                        message: '服务器错误，原因\n' + d.data,
                        type: 'error'
                    });
            }, function (d) {
                app.$message({
                    message: '未知错误',
                    type: 'error'
                });
            })
        },
        clickStop: function () {
            //    todo 停止问卷
            let app = this
            this.survey.enable = false
            this.cardloading = true
            ajaxPostJSON(this.urls.disableSurvey, this.survey, function (d) {
                if (d.code == 'success') {
                    app.cardloading = false
                    app.$message({
                        message: "操作成功",
                        type: 'success'
                    });
                    app.$emit("refresh", "update"); // 添加完成后刷新页面
                } else if (d.code == 'warning')
                    app.$message({
                        message: "操作失败",
                        type: 'error'
                    });
                else
                    app.$message({
                        message: '服务器错误，原因\n' + d.data,
                        type: 'error'
                    });
            }, function (d) {
                app.$message({
                    message: '未知错误',
                    type: 'error'
                });
            })
        },
        clickDelete: function () {
            let app = this
            this.cardloading = true
            ajaxPostJSON(this.urls.deleteSurvey, this.survey, function (d) {
                if (d.code == 'success') {
                    app.cardloading = false
                    app.$message({
                        message: "操作成功",
                        type: 'success'
                    });
                    app.$emit("refresh", "update"); // 添加完成后刷新页面
                } else if (d.code == 'warning')
                    app.$message({
                        message: "操作失败",
                        type: 'error'
                    });
                else
                    app.$message({
                        message: '服务器错误，原因\n' + d.data,
                        type: 'error'
                    });
            }, function (d) {
                app.$message({
                    message: '未知错误',
                    type: 'error'
                });
            })
        },
        clickPreview: function () {
            console.log('****', this.survey)
            window.parent.postMessage({
                data: {
                    type: "addTabSurveyPreview",
                    title: this.survey.title,
                    params: [this.survey.id]
                }
            }, '*');
        },
        clickSurveySituation: function () {
            window.parent.postMessage({
                data: {
                    type: "addTabDetail",
                    title: this.survey.title,
                    params: [this.survey.id]
                }
            }, '*');
        },
        clickAnswerSituation: function () {
            window.parent.postMessage({
                data: {
                    type: "addTabOverall",
                    title: this.survey.title,
                    params: [this.survey.id]
                }
            }, '*');
        },
    },
    data() {
        return {
            urls: {
                enableSurvey: serverUrl + "/api/survey/enableSurvey",
                disableSurvey: serverUrl + "/api/survey/enableSurvey",
                deleteSurvey: serverUrl + "/api/survey/deleteSurvey"
            },
            cardloading: false
        }
    }
})

let app = new Vue({
    el: "#app",
    components: {
        'my-component': myComponent
    },
    data: {
        qcode: {
            loading: false,
            visible: false,
            qrcodeObjcet: ''
        },
        user: {},
        showWindow: false,
        fullScreenLoading: false,
        urls: {
            querySurveyByConditions: serverUrl + "/api/survey/getSurveyByConditions",
            getAnswerCountByConditions: serverUrl + "/api/survey/getAnswerCountByConditions"
        },
        refreshType: {
            reload: "reload",
            update: "update"
        },
        onShowTable: {
            entities: [],
            params: {
                pageIndex: 1,
                pageSize: 5,
                pageSizes: [5, 10, 20],
                total: 500,       // 总数
            },
            condition: "",
            conditionType: "id",
            conditionTypes: [
                {
                    key: "id",
                    value: "问卷ID",
                },
                {
                    key: "title",
                    value: "问卷标题",
                },
                {
                    key: "description",
                    value: "问卷描述"
                }
            ]

        },
        totalTable: {
            /**
             *  private String id;
             *  private String ownerId;//创建人ID
             *  private String title;//问卷标题
             *  private String description;//问卷描述
             *  private Integer enable;//问卷是否启用
             *  private List<QuestionEntity> questions;//问题列表
             *  private Date startTime;//问卷开始填写时间
             *  private Date endTime;//问卷结束填写时间
             */
            entities: []
        },
        surveyEntity: {
            id: "",
            ownerId: "",
            title: "",
            description: "",
            enable: 0,
            questions: [],
            startTime: "",
            endTime: "",
        },
        AnsEntity: {
            questionId: "",
            answer: ""
        }
    },
    methods: {
        clickCreate: function () {
            window.parent.postMessage({
                data: {
                    type: "addTabCreateSurvey",
                    params: []
                }
            }, '*');
        },
        onPageIndexChange: function (currentIndex) {
            this.onShowTable.entities = this.totalTable.entities.slice((currentIndex - 1) * this.onShowTable.params.pageSize, (currentIndex * this.onShowTable.params.pageSize))
            // for (var j = 0, i = (currentIndex - 1) * this.onShowTable.params.pageSize;i<(currentIndex * this.onShowTable.params.pageSize);i++,j++){
            //     this.onShowTable.entities[j].questions = this.totalTable.entities[i].questions.slice(0)
            // }
        },
        onPageSizeChange: function (newSize) {
            this.onShowTable.params.pageSize = newSize;
            this.refresh(this.refreshType.reload)
        },
        refresh: function (type) {
            if (this.onShowTable.condition == "") {
                this.refreshTotalTable(type);
            } else {
                if (this.onShowTable.conditionType == "id") {
                    this.refreshTotalTableByID(this.onShowTable.condition, type);
                } else if (this.onShowTable.conditionType == "title") {
                    this.refreshTotalTableByTitle(this.onShowTable.condition, type);
                } else if (this.onShowTable.conditionType == "description") {
                    this.refreshTotalTableByDescription(this.onShowTable.condition, type);
                }
            }
        },
        refreshTotalTable: function (type) {
            this.initializeSurveyEntity();
            let app = this;
            // this.fullScreenLoading = true
            ajaxPostJSONAsync(this.urls.querySurveyByConditions, this.surveyEntity, function (d) {
                app.totalTable.entities = d.data;
                console.log("finish")
            }, function (d) {
                app.$message("服务器错误")
            })
            for (i in app.totalTable.entities) {
                var AnsServeyEntity ={}
                AnsServeyEntity.surveyId = app.totalTable.entities[i].id

                ajaxPostJSONAsync(this.urls.getAnswerCountByConditions, AnsServeyEntity, function (d) {

                    app.totalTable.entities[i].answerNum = d.data
                }, function (d) {
                    app.$message("服务器错误")
                })
            }

            

            // this.fullScreenLoading = false
            if (type == "reload") {
                app.reloadRefreshMethod()
            } else if (type == "update") {
                app.updateRefreshMethod()
            } else {
                app.$message("error，参数错误")
            }
        },
        refreshTotalTableByID: function (condition, type) {
            this.initializeSurveyEntity();
            this.surveyEntity.id = condition;
            let app = this;
            // this.fullScreenLoading = true
            ajaxPostJSONAsync(this.urls.querySurveyByConditions, this.surveyEntity, function (d) {
                app.totalTable.entities = d.data;
                if (type == "reload") {
                    app.reloadRefreshMethod()

                } else if (type == "update") {
                    app.updateRefreshMethod()
                } else {
                    app.$message("error，参数错误")
                }
            }, function (d) {
                app.$message("服务器错误")
            })

            for (i in app.totalTable.entities) {
                var AnsServeyEntity ={}
                AnsServeyEntity.surveyId = app.totalTable.entities[i].id

                ajaxPostJSONAsync(this.urls.getAnswerCountByConditions, AnsServeyEntity, function (d) {

                    app.totalTable.entities[i].answerNum = d.data
                }, function (d) {
                    app.$message("服务器错误")
                })
            }
            

            // this.fullScreenLoading = false
            if (type == "reload") {
                app.reloadRefreshMethod()
            } else if (type == "update") {
                app.updateRefreshMethod()
            } else {
                app.$message("error，参数错误")
            }
        },
        refreshTotalTableByTitle: function (condition, type) {
            this.initializeSurveyEntity();
            this.surveyEntity.title = condition;
            let app = this;
            // this.fullScreenLoading = true
            ajaxPostJSONAsync(this.urls.querySurveyByConditions, this.surveyEntity, function (d) {
                app.totalTable.entities = d.data;
                if (type == "reload") {
                    app.reloadRefreshMethod()

                } else if (type == "update") {
                    app.updateRefreshMethod()
                } else {
                    app.$message("error，参数错误")
                }
            }, function (d) {
                app.$message({
                    message: "服务器错误",
                    type: "error"
                })
            })
            for (i in app.totalTable.entities) {
                var AnsServeyEntity ={}
                AnsServeyEntity.surveyId = app.totalTable.entities[i].id

                ajaxPostJSONAsync(this.urls.getAnswerCountByConditions, AnsServeyEntity, function (d) {

                    app.totalTable.entities[i].answerNum = d.data
                }, function (d) {
                    app.$message("服务器错误")
                })
            }

            

            // this.fullScreenLoading = false
            if (type == "reload") {
                app.reloadRefreshMethod()
            } else if (type == "update") {
                app.updateRefreshMethod()
            } else {
                app.$message("error，参数错误")
            }
        },
        refreshTotalTableByDescription: function (condition, type) {
            this.initializeSurveyEntity();
            this.surveyEntity.description = condition;
            let app = this;
            // this.fullScreenLoading = true
            ajaxPostJSONAsync(this.urls.querySurveyByConditions, this.surveyEntity, function (d) {
                // this.fullScreenLoading = false
                app.totalTable.entities = d.data;
                if (type == "reload") {
                    app.reloadRefreshMethod()

                } else if (type == "update") {
                    app.updateRefreshMethod()
                } else {
                    app.$message("error，参数错误")
                }
            }, function (d) {
                app.$message({
                    message: "服务器错误",
                    type: "error"
                })
            })
            for (i in app.totalTable.entities) {
                var AnsServeyEntity ={}
                AnsServeyEntity.surveyId = app.totalTable.entities[i].id

                ajaxPostJSONAsync(this.urls.getAnswerCountByConditions, AnsServeyEntity, function (d) {

                    app.totalTable.entities[i].answerNum = d.data
                }, function (d) {
                    app.$message("服务器错误")
                })
            }

            

            // this.fullScreenLoading = false
            if (type == "reload") {
                app.reloadRefreshMethod()
            } else if (type == "update") {
                app.updateRefreshMethod()
            } else {
                app.$message("error，参数错误")
            }
        },
        updateRefreshMethod: function () {
            console.log(this.totalTable.entities)
            this.onShowTable.entities = this.totalTable.entities.slice((this.onShowTable.params.pageIndex - 1) * this.onShowTable.params.pageSize, (this.onShowTable.params.pageIndex * this.onShowTable.params.pageSize))
            // for (var j = 0, i = (this.onShowTable.params.pageIndex - 1) * this.onShowTable.params.pageSize;i<(this.onShowTable.params.pageIndex  * this.onShowTable.params.pageSize);i++,j++){
            //     this.onShowTable.entities[j].questions = this.totalTable.entities[i].questions.slice(0)
            // }
        },
        reloadRefreshMethod: function () {
            this.onShowTable.params.pageIndex = 1
            this.onShowTable.entities = this.totalTable.entities.slice((this.onShowTable.params.pageIndex - 1) * this.onShowTable.params.pageSize, (this.onShowTable.params.pageIndex * this.onShowTable.params.pageSize))
            // for (var j = 0, i = (this.onShowTable.params.pageIndex  - 1) * this.onShowTable.params.pageSize;i<(this.onShowTable.params.pageIndex  * this.onShowTable.params.pageSize);i++,j++){
            //     this.onShowTable.entities[j].questions = this.totalTable.entities[i].questions.slice(0)
            // }
        },
        initializeSurveyEntity: function () {
            this.surveyEntity.id = "";
            this.surveyEntity.ownerId = "";
            this.surveyEntity.title = "";
            this.surveyEntity.description = "";
            this.surveyEntity.enable = 0;
            this.surveyEntity.questions = [];
            this.surveyEntity.startTime = "";
            this.surveyEntity.endTime = "";
        },
        openDialog: function (id) {
            let app = this
            app.qcode.visible = true

            setTimeout(function () {
                let a = document.getElementById('codeArea')
                console.log(a)

                if (app.qcode.qrcodeObjcet != '') {
                    app.qcode.qrcodeObjcet.clear()
                    app.qcode.qrcodeObjcet.makeCode('https://wxxyx.m0yuqi.cn/survey/html/frame.html?surveyId=' + id)
                } else {
                    app.qcode.qrcodeObjcet = new QRCode(a, 'https://wxxyx.m0yuqi.cn/survey/html/frame.html?surveyId=' + id);
                    app.qcode.loading = false
                }


            }, 100)


        }


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
        if (app.user.role === 'student') {
            this.$message({
                message: "您无权访问当前页面",
                type: 'error'
            });
            return
        }
        app.showWindow = true
        // this.reloadRefreshMethod()
        this.refresh(this.refreshType.reload)
    }
})

