let myComponent = Vue.extend({
    props: {
        'survey': {
            type: Object
        }
    },
    template:`
        <el-card>
        <div slot="header">
            <span>
                {{survey.title}}
            </span>
            <span>
                ID:{{survey.id}}
                当前状态:{{survey.enable}}
                答卷数量:100
<!--                todo 答卷数量-->
            </span>
        </div>
        <div>
           <span>
                <el-button>
                    <span>全部答卷</span>
                </el-button>
                <el-button>
                    <span>星标答卷</span>
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
        clickEnable : function () {
            ajaxPostJSON(this.enableSurvey,this.survey,function (d) {
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
            },function (d) {
                app.$message({
                    message: '未知错误',
                    type: 'error'
                });
            })
        },
        clickStop : function () {
        //    todo 停止问卷
        },
        clickDelete: function () {
            ajaxPostJSON(this.deleteSurvey,this.survey,function (d) {
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
            },function (d) {
                app.$message({
                    message: '未知错误',
                    type: 'error'
                });
            })
        }
    },
    created: {
        
    },
    data:{
        urls:{
            enableSurvey: "http://localhost:8666/api/survey/postSurvey",
            deleteSurvey: "http://localhost:8666/api/survey/deleteSurvey"
        }
    }
})

let app = new Vue({
    el: "#app",
    data: {
        fullScreenLoading: false,
        urls:{
            querySurveyByConditions: "http://localhost:8666/api/survey/getSurveyByConditions"
        },
        refreshType:{
            reload:"reload",
            update:"update"
        },
        onShowTable:{
            entities:[],
            params: {
                pageIndex: 1,
                pageSize: 10,
                total: 500,       // 总数
            },
            condition: "",
            conditionType:"id",
            conditionTypes:[
                {
                    key:"id",
                    value:"问卷ID",
                },
                {
                    key:"title",
                    value:"问卷标题",
                },
                {
                    key:"description",
                    value:"问卷描述"
                }
            ]

        },
        totalTable:{
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
            entities:[]
        },
        surveyEntity:{
            id:"",
            ownerId:"",
            title:"",
            description:"",
            enable: 0,
            questions: [],
            startTime: "",
            endTime: "",
        }
    },
    methods: {
        onPageIndexChange: function (currentIndex) {
            this.onShowTable.entities = this.totalTable.entities.slice((currentIndex-1)*this.onShowTable.params.pageSize,(currentIndex*this.onShowTable.params.pageSize))
        },
        refresh: function(type){
            if(this.onShowTable.condition == ""){
                this.refreshTotalTable();
            }
            else {
                if(this.onShowTable.conditionType == "id"){
                    this.refreshTotalTableByID(this.onShowTable.condition);
                }
                else if(this.onShowTable.conditionType == "title"){
                    this.refreshTotalTableByTitle(this.onShowTable.condition);
                }
                else if(this.onShowTable.conditionType == "description"){
                    this.refreshTotalTableByDescription(this.onShowTable.condition);
                }
            }
            if(type == "reload"){
                this.reloadRefreshMethod()
            }
            else if(type == "update"){
                this.updateRefreshMethod()
            }
            else {
                this.$message("error，参数错误")
            }
        },
        refreshTotalTable: function () {
            this.initializeSurveyEntity();
            let app = this
            ajaxGet(this.urls.querySurveyByConditions,this.surveyEntity,function (d) {
                app.totalTable.entities = d.data;
            },function (d) {
                app.$message("服务器错误")
            })
        },
        refreshTotalTableByID: function(condition){
            this.initializeSurveyEntity();
            this.surveyEntity.id=condition;
            let app = this;
            ajaxGet(this.urls.querySurveyByConditions,this.surveyEntity,function (d) {
                app.totalTable.entities = d.data;
            },function (d) {
                app.$message("服务器错误")
            })
        },
        refreshTotalTableByTitle: function(condition){
            this.initializeSurveyEntity();
            this.surveyEntity.title=condition;
            let app = this;
            ajaxGet(this.urls.querySurveyByConditions,this.surveyEntity,function (d) {
                app.totalTable.entities = d.data;
            },function (d) {
                app.$message({
                    message:"服务器错误",
                    type:"error"
                })
            })
        },
        refreshTotalTableByDescription: function(condition){
            this.initializeSurveyEntity();
            this.surveyEntity.description=condition;
            let app = this;
            ajaxGet(this.urls.querySurveyByConditions,this.surveyEntity,function (d) {
                app.totalTable.entities = d.data;
            },function (d) {
                app.$message({
                    message:"服务器错误",
                    type:"error"
                })
            })
        },
        updateRefreshMethod: function(){
            this.onShowTable.entities = this.totalTable.entities.slice((this.onShowTable.params.pageIndex-1)*this.onShowTable.params.pageSize,(this.onShowTable.params.pageIndex*this.onShowTable.params.pageSize))
        },
        reloadRefreshMethod: function(){
            this.onShowTable.params.pageIndex = 1
        },
        initializeSurveyEntity: function () {
            this.surveyEntity.id="";
            this.surveyEntity.ownerId="";
            this.surveyEntity.title = "";
            this.surveyEntity.description = "";
            this.surveyEntity.enable = 0;
            this.surveyEntity.questions = [];
            this.surveyEntity.startTime = "";
            this.surveyEntity.endTime = "";
        }



    },
    components:{
        'myComponent': myComponent
    },
    created:function () {
        let app = this;
        app.user = getSessionStorage('user')
        //todo 权限验证

        this.refresh(this.refreshType.reload)
    }
})