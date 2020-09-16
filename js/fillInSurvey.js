let mySingleQuestion = Vue.extend({
    props: {
        'question': {
            type: Object
        },
        'list': {
            type: Array
        }
    },
    data() {
        return {
            //模块内属性
            // 题目属性
            title: "",
            isRequired: false,
            answerList: [],
        }
    },
    template: `
        <el-card class="box-card">
            <div slot="header" class="clearfix">
                <span v-if="question.isRequired" style="color: red">*</span>
                <span v-text="question.title"></span>
            </div>
            <div class="clearfix">
                <el-radio-group v-model="question.selectedList[0]">
                    <el-radio v-for="item in answerList" :key="item.index" :label="item.index">{{item.content}}</el-radio>
                </el-radio-group>  
            </div>
        </el-card>
    `,
    created: function () {
        this.title = this.question.title;
        this.isRequired = this.question.isRequired;
        this.answerList = this.question.answerList;
        if(!this.isRequired){
            this.question.checked = true;
        }
    },
    computed:{
        selectedList(){
            return this.question.selectedList;
        }
    },
    watch: {
        selectedList(val,oldval) {
            console.log(val,oldval);
            if(this.isRequired){
                this.question.checked = true;
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
        }
    },
    data() {
        return {
            //模块内属性
            // 题目属性
            title: "",
            isRequired: false,
            answerList: [],
        }
    },
    template: `
        <el-card class="box-card">
            <div slot="header" class="clearfix">
                <span v-if="question.isRequired" style="color: red">*</span>
                <span v-text="question.title"></span> 
            </div>
            <div class="clearfix">
                <el-checkbox-group v-model="question.selectedList">
                    <el-checkbox v-for="item in answerList" :key="item.index" :label="item.index">{{item.content}}</el-checkbox>
                </el-checkbox-group>  
            </div>
        </el-card>
    `,
    created: function () {
        this.title = this.question.title;
        this.isRequired = this.question.isRequired;
        this.answerList = this.question.answerList;
        if(!this.isRequired){
            this.question.checked = true;
        }
    },
    computed:{
        selectedList(){
            return this.question.selectedList;
        }
    },
    watch: {
        selectedList(val,oldval) {
            console.log(val,oldval);
            if(val.length != 0){
                this.question.checked = true;
            }
            else{
                this.question.checked = false;
                //todo 提示信息
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
        }
    },
    data() {
        return {
            //模块内属性
            // 题目属性
            title: "",
            isRequired: false,
            validationCheck:false,
            validationMessage:'',
            validationType: [
                {type: 'phone', text: '手机号'},
                {type: 'integer', text: '整数'},
                {type: 'rank', text: '分数段（管理员预置）'},
                {type: 'grade', text: '成绩（管理员预置）'}],
        }
    },
    template: `
        <el-card class="box-card">
            <div slot="header" class="clearfix">
                <span v-if="question.isRequired" style="color: red">*</span>
                <span v-text="question.title"></span>
                <span v-if="validationCheck" style="color: red">{{validationMessage}}</span>
            </div>
            <div class="clearfix">
                <el-input v-model="question.blankQuestionAns" :placeholder="question.defaultAns"></el-input>   
            </div>
        </el-card>
    `,
    created: function () {
        this.title = this.question.title;
        this.isRequired = this.question.isRequired;
        if(this.question.validation == ''){
            this.validationCheck = false;
        }
        else {
            this.validationCheck = true;
        }
        this.validationMessage = '';
        if(!this.isRequired){
            this.question.checked  = true;
        }
    },
    computed:{
        blankQuestionAns(){
            return this.question.blankQuestionAns;
        }
    },
    watch: {
        blankQuestionAns(val,oldval) {
            console.log(val,oldval);
            if(val.length != 0){
                if(this.question.validation == ''){
                    this.question.checked = true;
                }
                else if(this.question.validation == 'phone'){
                    if(!(/^1[3456789]\d{9}$/.test(val))){
                        this.question.checked = false;
                        this.validationMessage = '手机号格式错误'
                    }
                    else{
                        this.question.checked = true;
                        this.validationMessage = ''
                    }
                }
                else if(this.question.validation == 'integer'){
                    if(!(/^-?[1-9]\d*$/.test(val))){
                        this.question.checked = false;
                        this.validationMessage = '整数格式错误'
                    }
                    else{
                        this.question.checked = true;
                        this.validationMessage = ''
                    }
                }
                else if(this.question.validation == 'rank'){
                    //todo 排名正则表达式
                    // if(!(/^1[3456789]\d{9}$/.test(val))){
                    //     this.question.checked = false;
                    //     this.validationMessage = '排名格式错误'
                    // }
                    // else{
                    //     this.question.checked = true;
                    //     this.validationMessage = ''
                    // }
                }
                else if(this.question.validation == 'grade'){
                    //todo 成绩正则表达式
                    // if(!(/^1[3456789]\d{9}$/.test(val))){
                    //     this.question.checked = false;
                    //     this.validationMessage = '成绩格式错误'
                    // }
                    // else{
                    //     this.question.checked = true;
                    //     this.validationMessage = ''
                    // }
                }
            }
            else{
                this.question.checked = false;
                //todo 提示信息
            }
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
        }
    },
    data() {
        return {
            //模块内属性
            // 题目属性
            title: "",
            isRequired: false,
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
                <span v-if="question.isRequired" style="color: red">*</span>
                <span v-text="question.title"></span>
            </div>
            <div class="clearfix">
                <el-container> 
                    <el-main class="num">
                        <span v-for=" i in this.answerNum">{{i}}</span>
                    </el-main>           
                    <el-main stytle="display:grid !important; flex: 10;" class = "row">
                        <el-button plain v-for="item in leftArea" @click="clickLeft(item.index)">{{item.content}}</el-button> 
                    </el-main>
                     <el-main stytle="display:grid;flex: 10;" class = "row">
                        <el-button plain v-for="item in rightArea" @click="clickRight(item.index)">{{item.content}}</el-button>
                    </el-main>       
                </el-container>
            </div>
        </el-card>
    `,
    created: function () {
        this.title = this.question.title;
        this.isRequired = this.question.isRequired;
        this.leftArea = [];
        // {index: '选项A', content: 'A'}, {index: '选项B', content: 'B'}, {index: '选项C', content: 'C'}
        this.rightArea = this.question.answerList;
        this.answerNum = this.question.answerList.length;
        if(!this.isRequired){
            this.question.checked  = true;
        }
    },
    methods:{
        clickLeft: function (ansIndex){
            var temp= {};
            for (var i = 0;i < this.leftArea.length;i++){
                if (this.leftArea[i].index == ansIndex){
                    temp = this.leftArea[i];
                    this.leftArea.splice(i,1);
                    this.rightArea.push(temp);
                }
            }
        },
        clickRight: function (ansIndex) {
            var temp= {};
            for (var i = 0;i < this.rightArea.length;i++){
                if (this.rightArea[i].index == ansIndex){
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
                    this.question.checked = true;
                }
                else{
                    this.question.checked = false;
                    //todo 提示信息
                }
            },
            deep:true
        }
    }
})

let app = new Vue({
    el: "#app",
    data: {
        questionCount: 0,
        groupCount: 0,
        survey: {
            surveyTitle: '',
            description: '',
            questions: [
                {
                    //前端
                    checked:false,
                    //后端
                    id: '#1',
                    title: '单选',
                    index: 1,
                    type: "my-single",
                    isRequired: true,
                    defaultAns: '',
                    answerList: [{index: '选项A', content: 'A'}, {index: '选项B', content: 'B'}],
                    frontOptions: [],
                    skipLogices: [],
                    validation: '',
                    isPrivate: false,
                    selectedList: [],
                    blankQuestionAns:""
                },
                {
                    //前端
                    checked:false,
                    //后端
                    id: '#3',
                    title: '多选',
                    index: 2,
                    type: "my-multiple",
                    isRequired: true,
                    defaultAns: '',
                    answerList: [{index: '选项A', content: 'A'}, {index: '选项B', content: 'B'}],
                    frontOptions: [{question_id:'#1',question_answer:'选项A'}],
                    skipLogices: [],
                    validation: '',
                    isPrivate: false,
                    selectedList: [],
                    blankQuestionAns:""
                },
                {
                    //前端
                    checked:false,
                    //后端
                    id: '#5',
                    title: '填空',
                    index: 3,
                    type: "my-fill-blank",
                    isRequired: true,
                    defaultAns: '默认答案',
                    answerList: [],
                    frontOptions: [{question_id:'#3',question_answer:'选项A'},{question_id:'#3',question_answer:'选项B'}],
                    skipLogices: [],
                    validation: 'phone',
                    isPrivate: false,
                    selectedList: [],
                    blankQuestionAns:""
                },
                {
                    //前端
                    checked:false,
                    //后端
                    id: '#7',
                    title: '排序',
                    index: 4,
                    type: "my-order",
                    isRequired: true,
                    defaultAns: '',
                    answerList: [{index: '选项A', content: 'A'}, {index: '选项B', content: 'B'}, {index: '选项C', content: 'C'}],
                    frontOptions: [],
                    skipLogices: [],
                    validation: '',
                    isPrivate: false,
                    selectedList: [],
                    blankQuestionAns:""
                }]
        }
    },
    components: {
        'my-single': mySingleQuestion,
        'my-multiple': myMultipleQuestion,
        'my-fill-blank': myBlankQuestion,
        'my-order': myOrderQuestion,
    },
    created: function () {
        // 设置默认内容
        this.survey.surveyTitle = "默认问卷标题";
        this.survey.description = "默认问卷描述";
        // todo 权限检查
        // todo 从后端获取问卷

    },
    methods:{
        clickSubmit: function () {
            console.log("clickSubmit")
            for(var i in this.survey.questions){
                if(!this.survey.questions[i].checked){
                    this.$message.error('您还有未填写完成的题目');
                    return;
                }
            }
            //todo 上传数据
        },
        checkFrontOptions:function (question) {
            console.log("question:",question.id)
            for(var i in question.frontOptions){
                for(var j in this.survey.questions){

                    if(question.frontOptions[i].question_id == this.survey.questions[j].id){
                        console.log(question.frontOptions[i].question_id,this.survey.questions[j].id)
                        var hasAns = false
                        for(var k in this.survey.questions[j].selectedList){
                            console.log(this.survey.questions[j].selectedList[k],question.frontOptions[i].question_answer)
                            if(this.survey.questions[j].selectedList[k] == question.frontOptions[i].question_answer) {
                                hasAns = true;
                                break;
                            }
                        }
                        if(!hasAns){
                            return false;
                        }
                    }
                }
            }
            return true;
        }
    }
})

