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
                <el-radio-group v-model="question.selectedLists">
                    <el-radio v-for="item in answerList" :key="item.index" :label="item.index">{{item.content}}</el-radio>
                </el-radio-group>  
            </div>
        </el-card>
    `,
    created: function () {
        this.title = this.question.title;
        this.isRequired = this.question.isRequired;
        this.answerList = this.question.answerList;
    },
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
                <el-checkbox-group v-model="question.selectedLists">
                    <el-checkbox v-for="item in answerList" :key="item.index" :label="item.index">{{item.content}}</el-checkbox>
                </el-checkbox-group>  
            </div>
        </el-card>
    `,
    created: function () {
        this.title = this.question.title;
        this.isRequired = this.question.isRequired;
        this.answerList = this.question.answerList;
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
            </div>
            <div class="clearfix">
                <el-input v-model="question.blankQuestionAns" :placeholder="question.defaultAns"></el-input>   
            </div>
        </el-card>
    `,
    created: function () {
        this.title = this.question.title;
        this.isRequired = this.question.isRequired;
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
            questions: [{
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
                    selectedLists: [],
                    blankQuestionAns:""
                },
                {
                    title: '多选',
                    index: 2,
                    type: "my-multiple",
                    isRequired: true,
                    defaultAns: '',
                    answerList: [{index: '选项A', content: 'A'}, {index: '选项B', content: 'B'}],
                    frontOptions: [],
                    skipLogices: [],
                    validation: '',
                    isPrivate: false,
                    selectedLists: [],
                    blankQuestionAns:""
                },
                {
                    title: '填空',
                    index: 3,
                    type: "my-fill-blank",
                    isRequired: true,
                    defaultAns: '默认答案',
                    answerList: [],
                    frontOptions: [],
                    skipLogices: [],
                    validation: '',
                    isPrivate: false,
                    selectedLists: [],
                    blankQuestionAns:""
                },
                {
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
                    selectedLists: [],
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

    }
})

// todo 填空数据类型校验
// todo 必填校验
// todo 数据获取
// todo 数据上传
// todo 跳题逻辑（多条件下）

