let myComponent = Vue.extend({
    props: {
        'survey': {
            type: Object
        }
    },
    template: `
        <el-card style="margin:5px">
        <div slot="header" >
            <span>
                {{survey.title}}
            </span>
            <span style="float: right">
                <span style="margin-right: 5px">ID:{{survey.id}} </span>
                <span style="margin-right: 5px">当前状态:{{survey.enable}}</span>
                <span style="margin-right: 5px">答卷数量:{{survey.answerCount}}</span>
<!--                todo 答卷数量-->
            </span>
        </div>
        <div>
           <span>
                <el-button>
                    <span>答题情况</span>
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
            ajaxPostJSON(this.enableSurvey, this.survey, function (d) {
                if (d.code === 'success') {
                    app.$message({
                        message: "操作成功",
                        type: 'success'
                    });
                    app.refresh("update"); // 添加完成后刷新页面
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
            }, function (d) {
                app.$message({
                    message: '未知错误',
                    type: 'error'
                });
            })
        },
        clickStop: function () {
            //    todo 停止问卷
        },
        clickDelete: function () {
            ajaxPostJSON(this.deleteSurvey, this.survey, function (d) {
                if (d.code === 'success') {
                    app.$message({
                        message: "操作成功",
                        type: 'success'
                    });
                    app.refresh("update"); // 添加完成后刷新页面
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
            }, function (d) {
                app.$message({
                    message: '未知错误',
                    type: 'error'
                });
            })
        },
        clickPreview: function () {
            window.parent.postMessage({
                data: {
                    code:"success",
                    message:"addTabSurveyPreview"
                }
            }, '*');
        }
    },
    data() {
        return{
            urls: {
                enableSurvey: serverUrl + "/api/survey/postSurvey",
                deleteSurvey: serverUrl + "/api/survey/deleteSurvey"
            }
        }
    }
})

let app = new Vue({
    el: "#app",
    components: {
        'my-component': myComponent
    },
    data: {
        fullScreenLoading: false,
        urls: {
            querySurveyByConditions: serverUrl + "/api/survey/getSurveyByConditions",
            getAnswerCountByConditions: serverUrl+"/api/survey/getAnswerCountByConditions"

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
        }
    },
    methods: {
        onPageIndexChange: function (currentIndex) {
            this.onShowTable.entities = this.totalTable.entities.slice((currentIndex - 1) * this.onShowTable.params.pageSize, (currentIndex * this.onShowTable.params.pageSize))
            for (var j = 0, i = (currentIndex - 1) * this.onShowTable.params.pageSize;i<(currentIndex * this.onShowTable.params.pageSize);i++,j++){
                this.onShowTable.entities[j].questions = this.totalTable.entities[i].questions.slice(0)
            }
        },
        onPageSizeChange: function(newSize){
            this.onShowTable.params.pageSize = newSize;
            this.refresh(this.refreshType.reload)
        },
        refresh: function (type) {
            if (this.onShowTable.condition == "") {
                this.refreshTotalTable(type);
            } else {
                if (this.onShowTable.conditionType == "id") {
                    this.refreshTotalTableByID(this.onShowTable.condition,type);
                } else if (this.onShowTable.conditionType == "title") {
                    this.refreshTotalTableByTitle(this.onShowTable.condition,type);
                } else if (this.onShowTable.conditionType == "description") {
                    this.refreshTotalTableByDescription(this.onShowTable.condition,type);
                }
            }
        },
        refreshTotalTable: function (type) {
            this.initializeSurveyEntity();
            let app = this;
            ajaxPostJSON(this.urls.querySurveyByConditions, this.surveyEntity, function (d) {
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
        },
        refreshTotalTableByID: function (condition,type) {
            this.initializeSurveyEntity();
            this.surveyEntity.id = condition;
            let app = this;
            ajaxPostJSON(this.urls.querySurveyByConditions, this.surveyEntity, function (d) {
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
        },
        refreshTotalTableByTitle: function (condition,type) {
            this.initializeSurveyEntity();
            this.surveyEntity.title = condition;
            let app = this;
            ajaxPostJSON(this.urls.querySurveyByConditions, this.surveyEntity, function (d) {
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
        },
        refreshTotalTableByDescription: function (condition,type) {
            this.initializeSurveyEntity();
            this.surveyEntity.description = condition;
            let app = this;
            ajaxPostJSON(this.urls.querySurveyByConditions, this.surveyEntity, function (d) {
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
        },
        updateRefreshMethod: function () {
            console.log(this.totalTable.entities)
            this.onShowTable.entities = this.totalTable.entities.slice((this.onShowTable.params.pageIndex - 1) * this.onShowTable.params.pageSize, (this.onShowTable.params.pageIndex * this.onShowTable.params.pageSize))
            for (var j = 0, i = (currentIndex - 1) * this.onShowTable.params.pageSize;i<(currentIndex * this.onShowTable.params.pageSize);i++,j++){
                this.onShowTable.entities[j].questions = this.totalTable.entities[i].questions.slice(0)
            }
        },
        reloadRefreshMethod: function () {
            this.onShowTable.params.pageIndex = 1
            this.onShowTable.entities = this.totalTable.entities.slice((this.onShowTable.params.pageIndex - 1) * this.onShowTable.params.pageSize, (this.onShowTable.params.pageIndex * this.onShowTable.params.pageSize))
            for (var j = 0, i = (currentIndex - 1) * this.onShowTable.params.pageSize;i<(currentIndex * this.onShowTable.params.pageSize);i++,j++){
                this.onShowTable.entities[j].questions = this.totalTable.entities[i].questions.slice(0)
            }
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
        }


    },
    created: function () {
        let app = this;
        app.user = getSessionStorage('user')
        //todo 权限验证
        // this.reloadRefreshMethod()
        this.refresh(this.refreshType.reload)
    }
})

