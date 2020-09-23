let mySingleQuestion = Vue.extend({
    props: {
        'question': {
            type: Object
        },
        'list': {
            type: Array
        },
        'clean':{
            type: String
        }

    },
    data() {
        return {
            //模块内属性
            // 题目属性
            questionInner: []
        }
    },
    template: `
        <el-card class="box-card">
            <div slot="header" class="clearfix">
                <span v-if="questionInner.required" style="color: #ff0000">*</span>
                <span v-text="questionInner.title"></span>
            </div>
            <div class="clearfix">
                <el-radio-group v-model="questionInner.selectedList[0]">
                    <el-radio v-for="item in questionInner.answerList" :key="item" :label="item">{{item}}</el-radio>
                </el-radio-group>  
            </div>
        </el-card>
    `,
    created: function () {
        this.questionInner = JSON.parse(JSON.stringify(this.question));
        this.questionInner.selectedList = []
        if(this.questionInner.required){
            this.questionInner.checked = true;
        }
    },
    computed:{
        onselectedList(){
            return this.questionInner.selectedList;
        }
    },
    watch: {
        onselectedList(val,oldval) {
            if(!this.questionInner.required){
                this.questionInner.checked = true;
            }
            this.$emit("submit-questions",JSON.stringify(this.questionInner))
        },
        clean(val,oldval){
          if(val == this.questionInner.id){
              var tmp = []
              this.questionInner.selectedList = tmp.slice(0)
          }
        },
        deep:true
    }
})

let myMultipleQuestion = Vue.extend({
    props: {
        'question': {
            type: Object
        },
        'list': {
            type: Array
        },
        'clean':{
            type: String
        }
    },
    data() {
        return {
            questionInner:{}
        }
    },
    template: `
        <el-card class="box-card">
            <div slot="header" class="clearfix">
                <span v-if="questionInner.required" style="color: red">*</span>
                <span v-text="questionInner.title"></span> 
            </div>
            <div class="clearfix">
                <el-checkbox-group v-model="questionInner.selectedList">
                    <el-checkbox v-for="item in questionInner.answerList" :key="item" :label="item" :value="item">{{item}}</el-checkbox>
                </el-checkbox-group>  
            </div>
        </el-card>
    `,
    created: function () {
        this.questionInner = JSON.parse(JSON.stringify(this.question));
        this.questionInner.selectedList = []
        if(!this.questionInner.required){
            this.questionInner.checked = true;
        }
    },
    computed:{
        selectedList(){
            return this.questionInner.selectedList;
        }
    },
    watch: {
        selectedList(val,oldval) {
            if(val.length != 0){
                this.questionInner.checked = true;
            }
            else{
                this.questionInner.checked = false;
                //todo 提示信息
            }
            this.$emit("submit-questions",JSON.stringify(this.questionInner))
        },
        clean(val,oldval){
            console.log("MULTYPLE",val,this.questionInner.id)
            if(val == this.questionInner.id){
                var tmp = []

                this.questionInner.selectedList = tmp.slice(0)
                this.$forceUpdate()
            }
        },
        deep:true
    }
})

let myBlankQuestion = Vue.extend({
    props: {
        'question': {
            type: Object
        },
        'list': {
            type: Array
        },
        'clean':{
            type:String
        }
    },
    data() {
        return {
            questionInner: {},
            validationCheck: false,
            validationMessage: '',
            configParam:"",
            validationType: [
                {type: 'phone', text: '手机号'},
                {type: 'integer', text: '整数'},
                {type: 'rank', text: '分数段（管理员预置）'},
                {type: 'grade', text: '成绩（管理员预置）'}],
            urls:{
                    selectConfig:"/api/sys/config/selectConfigListByPage"
            }
        }
    },
    template: `
        <el-card class="box-card">
            <div slot="header" class="clearfix">
                <span v-if="questionInner.required" style="color: red">*</span>
                <span v-text="questionInner.title"></span>
                <span v-if="validationCheck" style="color: red">{{validationMessage}}</span>
            </div>
            <div class="clearfix">
                <el-input v-model="questionInner.blankQuestionAns" :placeholder="questionInner.defaultAns"></el-input>   
            </div>
        </el-card>
    `,
    created: function () {
        this.questionInner = JSON.parse(JSON.stringify(this.question));
        if (this.question.validation == '') {
            this.validationCheck = false;
        } else {
            this.validationCheck = true;
        }
        this.validationMessage = '';
        this.questionInner.blankQuestionAns = ""
        if (!this.questionInner.required) {
            this.questionInner.checked = true;
        }
    },
    computed: {
        blankQuestionAns() {
            return this.questionInner.blankQuestionAns;
        }
    },
    watch: {
        blankQuestionAns(val, oldval) {
            console.log(val, oldval);
            if (val.length != 0) {
                if (this.questionInner.validationMessage == null || this.questionInner.validation == '') {
                    this.questionInner.checked = true;
                    this.validationMessage =""
                } else if (this.questionInner.validation == 'phone') {
                    if (!(/^1[3456789]\d{9}$/.test(val))) {
                        this.questionInner.checked = false;
                        this.validationMessage = '手机号格式错误'
                    } else {
                        this.questionInner.checked = true;
                        this.validationMessage = ''
                    }
                } else if (this.questionInner.validation == 'integer') {
                    if (!(/^-?[1-9]\d*$/.test(val))) {
                        this.questionInner.checked = false;
                        this.validationMessage = '整数格式错误'
                    } else {
                        this.questionInner.checked = true;
                        this.validationMessage = ''
                    }
                } else {

                    this.questionInner.validation
                    var ConfigEntity={}
                    ConfigEntity.id = ""
                    ConfigEntity.configKey = this.questionInner.validation
                    ConfigEntity.configValue = ""
                    ConfigEntity.remark = ""
                    app = this
                    ajaxPostJSONAsync(this.urls.selectConfig,ConfigEntity,function (d) {
                        var resList = d.result;
                        app.configParam = resList[0];
                        console.log(app.configParam)
                    })
                    this.validationMessage = this.questionInner.validation + this.configParam
                    if(eval(val+this.configParam)){
                        this.validationMessage = ''
                    }

                }
            } else {
                this.questionInner.checked = false;
                this.validationMessage = ''
                //todo 提示信息
            }
            this.$emit("submit-questions",JSON.stringify(this.questionInner))
        }
    }
})

let myOrderQuestion = Vue.extend({
    props: {
        'question': {
            type: Object
        },
        'list': {
            type: Array
        },
        'clean':{
            type:String
        }
    },
    data() {
        return {
            //模块内属性
            // 题目属性
            title: "",
            required: false,
            questionInner:{},
            validationType: [
                {type: 'phone', text: '手机号'},
                {type: 'integer', text: '整数'},
                {type: 'rank', text: '分数段（管理员预置）'},
                {type: 'grade', text: '成绩（管理员预置）'}],
            leftArea: [],
            rightArea:[],
            answerNum: 0,
        }
    },
    template: `
        <el-card class="box-card">
            <div slot="header" class="clearfix">
                <span v-if="required" style="color: red">*</span>
                <span v-text="title"></span>
            </div>
            <div class="clearfix">
                <el-container> 
                    <el-main class="num">
                        <span v-for=" i in answerNum" style="height: 40px;margin-bottom: 10px">{{i}}</span>
                    </el-main>           
                    <el-main stytle="display:grid !important; flex: 10;" class = "row">
                        <el-button plain v-for="item in leftArea" :key="item" @click="clickLeft(item)">{{item}}</el-button> 
                    </el-main>
                     <el-main stytle="display:grid;flex: 10;" class = "row">
                        <el-button plain v-for="item in rightArea" :key="item" @click="clickRight(item)">{{item}}</el-button>
                    </el-main>       
                </el-container>
            </div>
        </el-card>
    `,
    created: function () {
        this.title = this.question.title;
        this.required = this.question.required;
        this.questionInner = JSON.parse(JSON.stringify(this.question))
        this.questionInner.orderAnswer = [];
        this.leftArea = [];
        // {index: '选项A', content: 'A'}, {index: '选项B', content: 'B'}, {index: '选项C', content: 'C'}
        this.rightArea = this.question.answerList;
        this.answerNum = this.question.answerList.length;
        if(!this.required){
            this.questionInner.checked  = true;
        }
    },
    methods:{
        clickLeft: function (ans){
            var temp= {};
            for (var i = 0;i < this.leftArea.length;i++){
                if (this.leftArea[i] == ans){
                    temp = this.leftArea[i];
                    this.leftArea.splice(i,1);
                    this.rightArea.push(temp);
                }
            }
        },
        clickRight: function (ans) {
            var temp= {};
            for (var i = 0;i < this.rightArea.length;i++){
                if (this.rightArea[i] == ans){
                    temp = this.rightArea[i];
                    this.rightArea.splice(i,1);
                    this.leftArea.push(temp);
                }
            }
        }
    },
    watch: {
        leftArea:{
            handler(val,oldval){
                console.log(val,oldval);
                if(val.length == this.answerNum){
                    this.questionInner.checked = true;
                }
                else{
                    this.questionInner.checked = false;
                    //todo 提示信息
                }

                this.questionInner.orderAnswer = this.leftArea.slice(0)
                this.$emit("submit-questions",JSON.stringify(this.questionInner))
            },
            deep:true
        }
    }
})

let app = new Vue({
    el: "#app",
    data() {
        return{
            clean:"",
            renderStatus:[true,true,true,true,true,true,false],
            questionCount: 0,
            groupCount: 0,
            survey: {
                surveyTitle: '',
                description: '',
                id: "",
                ownerId:"",
                questions: []
            },
            urls:{
                getSurveyByConditions:serverUrl+"/api/survey/getSurveyByConditions",
                insertAnswer:serverUrl+"/api/survey/insertOrUpdateAnswer"
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
        }

    },
    components: {
        'SINGLE': mySingleQuestion,
        'MULTIPLE': myMultipleQuestion,
        'FILL_BLANK': myBlankQuestion,
        'ORDER': myOrderQuestion,
    },
    created: function () {
        // 设置默认内容
        this.survey.surveyTitle = "默认问卷标题";
        this.survey.description = "默认问卷描述";
        // todo 权限检查
        // todo 从后端获取问卷
        var tmp_id = getSessionStorage("fill-in-survey-id")
        delSessionStorage("fill-in-survey-id")
        if(tmp_id != ""){
            this.getSurvey(tmp_id)
        }
        else{
            this.$message("问卷参数错误")
        }
    },
    methods:{
        getSurvey: function(id){
            this.initializeSurveyEntity();
            this.surveyEntity.id = id;
            let app = this;
            ajaxPostJSON(this.urls.getSurveyByConditions, this.surveyEntity, function (d) {
                app.survey.surveyTitle = d.data[0].title;
                app.survey.description = d.data[0].description;
                app.survey.questions= d.data[0].questions;
                app.survey.id = d.data[0].id
                app.survey.ownerId = d.data[0].ownerId
                for(i in app.survey.questions){
                    if(d.data[0].questions[i].answerList)
                        app.survey.questions[i].answerList = d.data[0].questions[i].answerList.slice(0)
                    if(d.data[0].questions[i].frontOptions)
                        app.survey.questions[i].frontOptions = d.data[0].questions[i].frontOptions.slice(0)
                    app.survey.questions[i].selectedList=[];
                    app.survey.questions[i].blankQuestionAns = ""
                    app.survey.questions[i].checked = false
                }
                console.log(d.data)
                var temp = []
                for(i in app.survey.questions){
                    if(app.survey.questions[i].frontOptions.length == 0)
                        temp.push(true)
                    else
                        temp.push(false)
                }
                console.log("create",temp)
                app.renderStatus = temp
            }, function (d) {
                app.$message("服务器错误")
            })
        },
        clickSubmit: function () {
            console.log("clickSubmit")

            for(var i in this.survey.questions){
                if(this.renderStatus[i]){
                    if(!this.survey.questions[i].checked){
                        this.$message.error('您还有未填写完成的题目');
                        return;
                    }
                }
            }




            this.$emit("collectQuestions")

            var AnsSurveyEntity={}
            AnsSurveyEntity.surveyId = this.survey.id
            AnsSurveyEntity.respondentId = JSON.parse(getSessionStorage("user")).id
            AnsSurveyEntity.ansList = []




            for(var i in this.survey.questions){
                var AnsEntity={}
                var ans = ""
                AnsEntity.questionId = this.survey.questions[i].id
                if(this.survey.questions[i].type === "SINGLE"){

                    for(j in this.survey.questions[i].selectedList){
                        ans+=this.survey.questions[i].selectedList[j]
                        if(j != this.survey.questions[i].selectedList.length-1){
                            ans+="@@"
                        }
                    }
                    AnsEntity.answer = ans
                }
                else if(this.survey.questions[i].type === "MULTIPLE"){
                    for(j in this.survey.questions[i].selectedList){
                        ans+=this.survey.questions[i].selectedList[j]
                        if(j != this.survey.questions[i].selectedList.length-1){
                            ans+="@@"
                        }
                    }
                    AnsEntity.answer = ans
                }
                else if(this.survey.questions[i].type === "FILL_BLANK"){
                    AnsEntity.answer = this.survey.questions[i].blankQuestionAns
                }
                else if(this.survey.questions[i].type === "ORDER"){
                    for(j in this.survey.questions[i].orderAnswer){
                        ans+=this.survey.questions[i].orderAnswer[j]
                        if(j != this.survey.questions[i].orderAnswer.length-1){
                            ans+="@@"
                        }
                    }
                    AnsEntity.answer = ans
                }
                AnsSurveyEntity.ansList.push(AnsEntity)
            }
            console.log(AnsSurveyEntity)

            app = this
            ajaxPostJSONAsync(this.urls.insertAnswer,AnsSurveyEntity,function (d) {
                if (d.status == 'success') {
                    app.cardloading = false
                    app.$message({
                        message: "保存成功",
                        type: 'success'
                    });
                    window.parent.postMessage({
                        data: {
                            type:"addTabHistorySurvey",
                            params:[]
                        }
                    }, '*');

                } else if (d.status == 'warning'){
                    app.$message({
                        message: "操作失败",
                        type: 'error'
                    });
                }


            },function (d) {
                app.$message({
                    message: '未知错误',
                    type: 'error'
                });
            })

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
        submitQuestions:function(v){
            questionInner = JSON.parse(v)
            var temp = 0;
            for(i in this.survey.questions){
                if(this.survey.questions[i].id == questionInner.id){
                    temp = i;
                    break;
                }
            }
            this.survey.questions[i] = JSON.parse(JSON.stringify(questionInner))

            this.checkRenderStatus(questionInner)
            // console.log(this.survey.questions[i])
        },
        checkRenderStatus: function(question){
            var temp = []
            for (i in this.renderStatus){
                temp.push(this.renderStatus[i])
            }
            console.log("check",temp)
            for(i in this.survey.questions){
                var flag = false
                var used = false
                for(j in this.survey.questions[i].frontOptions){
                    if(this.survey.questions[i].frontOptions[j].questionId == question.id){
                        used = true
                        for(k in question.selectedList){
                            if(question.selectedList[k] == question.answerList[this.survey.questions[i].frontOptions[j].questionAnswer]){
                                flag = true
                            }
                        }
                    }
                }

                if(used){
                    temp[i] = flag
                    if(this.survey.questions[i].frontOptions.length == 0 || this.survey.questions[i].id == question.id){
                        temp[i] = true
                    }
                    if(temp[i] == false){
                        if(this.survey.questions[i].type === "SINGLE" || this.survey.questions[i].type === "MULTIPLE") {

                            var tmp = []
                            this.survey.questions[i].selectedList = []
                            this.clean = this.survey.questions[i].id
                            console.log(i,this.clean)
                        }
                        else if(this.survey.questions[i].type === "ORDER") {
                            var tmp = []

                            this.survey.questions[i].orderAnswer = []
                            this.clean = this.survey.questions[i].id
                            console.log(i,this.clean)

                        }
                        else if(this.survey.questions[i].type === "FILL_BLANK"){

                            this.survey.questions[i].blankQuestionAns = ""
                            this.clean = this.survey.questions[i].id
                            console.log(i,this.clean)
                        }

                    }
                }


            }
            this.renderStatus = temp
            // console.log(this.renderStatus)
        }
    },
    computed:{
        onRenderStatus:function () {
            // console.log(this.renderStatus)
            return this.renderStatus;
        }
    },
    watch:{
        onRenderStatus(val, oldval) {
            // console.log(val)
        },
        deep:true
    }
})

