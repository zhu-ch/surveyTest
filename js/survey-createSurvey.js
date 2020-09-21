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
            disableEdit: false,
            enableFrontOptions: false,
            multipleFrontOptions: false,
            furtherOption: {},
            disableChangeStatus: false,
            selectedQuestionId: '',
            selectedOption: '',
            //题目属性
            title: this.question.title,
            isRequired: this.question.isRequired,
            answerList: [{index: '选项A', content: ''}, {index: '选项B', content: ''}],
            frontOptions: [],
            isPrivate: false
        }
    },
    template: `
        <el-card class="box-card">
            <div slot="header" class="clearfix">
                <span>{{question.index}}(单选)</span>
                <el-button style="float: right; padding: 3px 0" type="text"
                            @click="deleteThisQuestion">移除
                </el-button>
            </div>
            <div>
                <!--todo 调整格式-->
                <div style="margin-bottom: 10px">
                    <!--题目-->
                    <el-input v-model="title" :disabled="disableEdit" placeholder="请输入题目描述"></el-input>
                </div>
                <div style="margin-bottom: 10px">
                    <!--各选项内容-->
                    <el-input v-for="item in answerList" v-model="item.content"
                                :placeholder="item.index" :disabled="disableEdit"></el-input>
                </div>
                <div style="height:50px;width: 100%;margin-bottom: 10px;">
                    <!--添加选项-->
                    <el-button type="primary" icon="el-icon-plus" circle @click="addContent"
                                :disabled="disableEdit"></el-button>
                    <!--移除最后一个选项-->
                    <el-button type="danger" icon="el-icon-minus" circle @click="deleteContent"
                                :disabled="disableEdit || answerList.length<=1"></el-button>
                    <!--是否为隐私项-->
                    <el-switch v-model="isPrivate" :disabled="disableEdit" 
                                active-text="隐私项" inactive-text="非隐私项"style="margin-left:20px;margin-right: 10px"
                                active-color="#13ce66" inactive-color="#ff4949"></el-switch>
                    <!--是否必填-->
                    <el-switch v-model="isRequired" :disabled="disableEdit" 
                                active-text="必填项" inactive-text="非必填项" style="margin-left:20px;margin-right: 10px"
                                active-color="#13ce66" inactive-color="#ff4949"></el-switch>
                    <!--是否启用跳题逻辑-->
                    <el-switch v-model="enableFrontOptions" :disabled="disableEdit" 
                    style="margin-left:20px;margin-right: 10px" active-text="启用跳题逻辑" inactive-text="关闭跳题逻辑"
                                active-color="#13ce66" inactive-color="#ff4949"></el-switch>
                </div>
                <!--跳题逻辑设置-->
                <div v-if="enableFrontOptions" style="width:100%;margin-bottom: 15px;">
                    当<strong>题目</strong>
                    <el-select v-model="selectedQuestionId" :disabled="disableEdit">
                        <el-option v-for="item in list" :key="item.id" :label="item.title" :value="item.id"
                                    v-if="item.submitted && ['my-single', 'my-multiple', 'my-select'].indexOf(item.type) != -1">
                        </el-option>
                    </el-select>
                    的<strong>选项</strong>
                    <el-select v-model="selectedOption" :disabled="disableEdit" v-if="selectedQuestionId != ''">
                        <el-option v-for="item in selectedQuestion.answerList" :key="item.index" 
                                    :label="item.content" :value="item.index"></el-option>
                    </el-select>
                    选中时，显示此题目
                </div>
                <div style=";margin-top: 15px">
                    <!--提交/编辑本题-->
                    <el-button style="width: 100%":type="buttonType" @click="changeStatus"  :disabled="disableChangeStatus">{{buttonText}}</el-button>
                </div>
            </div>
        </el-card>
    `,
    methods: {
        deleteThisQuestion: function () {
            let idx = this.question.index;
            this.$emit('delete-question-by-index', idx)
        },
        changeStatus: function () {
            if (this.disableEdit) {
                this.$emit('revert-this-question', this.question);
                this.disableEdit = false
            } else {
                this.question.title = this.title;
                this.question.isRequired = this.isRequired;
                this.question.answerList = this.answerList;
                this.question.isPrivate = this.isPrivate;
                if (!this.enableFrontOptions) {
                    this.selectedQuestionId = ''
                    this.selectedOption = ''
                    this.question.frontOptions = []
                } else {
                    this.question.frontOptions = [{
                        questionId: this.selectedQuestionId,
                        questionAnswer: this.selectedOption
                    }];
                    if (this.multipleFrontOptions)
                        this.question.frontOptions.push(this.furtherOption)
                }

                this.$emit('submit-this-question', this.question);
                this.disableEdit = true
            }
        },
        addContent: function () {
            let n = this.answerList.length;
            this.answerList.push({index: '选项' + String.fromCharCode(65 + n), content: ''});
        },
        deleteContent: function () {
            if (this.answerList.length <= 1)
                return;
            this.answerList.pop();
        }
    },
    computed: {
        buttonText: function () {
            return this.disableEdit ? '编辑' : '确定'
        },
        buttonType: function () {
            return this.disableEdit ? 'warning' : 'primary'
        },
        selectedQuestion: function () {
            for (let i = 0; i < this.list.length; i++) {
                if (this.selectedQuestionId === this.list[i].id)
                    return this.list[i]
            }
        }
    },
    created: function () {
        if (this.question.submitted) {
            this.disableEdit = false;
            this.enableFrontOptions = !!this.question.frontOptions.length;
            this.multipleFrontOptions = this.question.frontOptions.length > 1;
            if (this.enableFrontOptions) {
                this.selectedQuestionId = this.question.frontOptions[0].questionId;
                this.selectedOption = this.question.frontOptions[0].questionAnswer;
            }
            if (this.multipleFrontOptions) {
                this.furtherOption = this.question.frontOptions[1];
                this.disableChangeStatus = true;
            }
            this.title = this.question.title;
            this.isRequired = this.question.isRequired;
            this.answerList = this.question.answerList;
            this.frontOptions = this.question.frontOptions;
            this.isPrivate = this.question.isPrivate;
            this.changeStatus();
        }
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
            disableEdit: false,
            enableFrontOptions: false,
            selectedQuestionId: '',
            selectedOption: '',
            //题目属性
            title: this.question.title,
            isRequired: this.question.isRequired,
            answerList: [{index: '选项A', content: ''}, {index: '选项B', content: ''}],
            frontOptions: [],
            isPrivate: false
        }
    },
    template: `
        <el-card class="box-card">
            <div slot="header" class="clearfix">
                <span>{{question.index}}(多选)</span>
                <el-button style="float: right; padding: 3px 0" type="text"
                            @click="deleteThisQuestion">移除
                </el-button>
            </div>
            <div>
                <!--todo 调整格式-->
                <div style="margin-bottom: 10px">
                    <!--题目-->
                    <el-input v-model="title" :disabled="disableEdit" placeholder="请输入题目描述"></el-input>
                </div>
                <div style="margin-bottom: 10px">
                    <!--各选项内容-->
                    <el-input v-for="item in answerList" v-model="item.content"
                                :placeholder="item.index" :disabled="disableEdit"></el-input>
                </div>
                <div style="height:50px;width: 100%;margin-bottom: 10px;">
                    <!--添加选项-->
                    <el-button type="primary" icon="el-icon-plus" circle @click="addContent"
                                :disabled="disableEdit"></el-button>
                    <!--移除最后一个选项-->
                    <el-button type="danger" icon="el-icon-minus" circle @click="deleteContent"
                                :disabled="disableEdit || answerList.length<=2"></el-button>
                    <!--是否为隐私项-->
                    <el-switch v-model="isPrivate" :disabled="disableEdit" 
                                active-text="隐私项" inactive-text="非隐私项"style="margin-left:20px;margin-right: 10px"
                                active-color="#13ce66" inactive-color="#ff4949"></el-switch>
                    <!--是否必填-->
                    <el-switch v-model="isRequired" :disabled="disableEdit" 
                                active-text="必填项" inactive-text="非必填项" style="margin-left:20px;margin-right: 10px"
                                active-color="#13ce66" inactive-color="#ff4949"></el-switch>
                    <!--是否启用跳题逻辑-->
                    <el-switch v-model="enableFrontOptions" :disabled="disableEdit" 
                                style="margin-left:20px;margin-right: 10px" active-text="启用跳题逻辑" inactive-text="关闭跳题逻辑"
                                active-color="#13ce66" inactive-color="#ff4949"></el-switch>
                </div>
                <!--跳题逻辑设置-->
                <div v-if="enableFrontOptions" style="width:100%;margin-bottom: 15px;">
                    当<strong>题目</strong>
                    <el-select v-model="selectedQuestionId" :disabled="disableEdit">
                        <el-option v-for="item in list" :key="item.id" :label="item.title" :value="item.id"
                                    v-if="item.submitted && ['my-single', 'my-multiple', 'my-select'].indexOf(item.type) != -1">
                        </el-option>
                    </el-select>
                    的<strong>选项</strong>
                    <el-select v-model="selectedOption" :disabled="disableEdit" v-if="selectedQuestionId != ''">
                        <el-option v-for="item in selectedQuestion.answerList" :key="item.index" 
                                    :label="item.content" :value="item.index"></el-option>
                    </el-select>
                    选中时，显示此题目
                </div>
                <!--提交/编辑本题-->
                <div style=";margin-top: 15px">
                    <el-button style="width: 100%":type="buttonType" @click="changeStatus">{{buttonText}}</el-button>
                </div>
            </div>
        </el-card>
    `,
    methods: {
        deleteThisQuestion: function () {
            let idx = this.question.index;
            this.$emit('delete-question-by-index', idx)
        },
        changeStatus: function () {
            if (this.disableEdit) {
                this.$emit('revert-this-question', this.question);
                this.disableEdit = false
            } else {
                this.question.title = this.title;
                this.question.isRequired = this.isRequired;
                this.question.answerList = this.answerList;
                this.question.isPrivate = this.isPrivate;
                if (!this.enableFrontOptions) {
                    this.selectedQuestionId = ''
                    this.selectedOption = ''
                    this.question.frontOptions = []
                } else {
                    this.question.frontOptions = [{
                        questionId: this.selectedQuestionId,
                        questionAnswer: this.selectedOption
                    }];
                }

                this.$emit('submit-this-question', this.question);
                this.disableEdit = true
            }
        },
        addContent: function () {
            let n = this.answerList.length;
            this.answerList.push({index: '选项' + String.fromCharCode(65 + n), content: ''});
        },
        deleteContent: function () {
            if (this.answerList.length <= 2)
                return;
            this.answerList.pop();
        }
    },
    computed: {
        buttonText: function () {
            return this.disableEdit ? '编辑' : '确定'
        },
        buttonType: function () {
            return this.disableEdit ? 'warning' : 'primary'
        },
        selectedQuestion: function () {
            for (let i = 0; i < this.list.length; i++) {
                if (this.selectedQuestionId === this.list[i].id)
                    return this.list[i]
            }
        }
    },
    created: function () {
        if (this.question.submitted) {
            this.disableEdit = false;
            this.enableFrontOptions = !!this.question.frontOptions.length;
            if (this.enableFrontOptions) {
                this.selectedQuestionId = this.question.frontOptions[0].questionId;
                this.selectedOption = this.question.frontOptions[0].questionAnswer;
            }
            this.title = this.question.title;
            this.isRequired = this.question.isRequired;
            this.answerList = this.question.answerList;
            this.frontOptions = this.question.frontOptions;
            this.isPrivate = this.question.isPrivate;
            this.changeStatus();
        }
    }
});

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
            disableEdit: false,
            enableFrontOptions: false,
            multipleFrontOptions: false,
            furtherOption: {},
            disableChangeStatus: false,
            selectedQuestionId: '',
            selectedOption: '',
            enableValidation: false,
            validationType: [
                {type: 'phone', text: '手机号'},
                {type: 'integer', text: '整数'},
                {type: 'rank', text: '分数段（管理员预置）'},
                {type: 'grade', text: '成绩（管理员预置）'}],
            //题目属性
            title: this.question.title,
            isRequired: this.question.isRequired,
            frontOptions: [],
            validation: '',
            isPrivate: false
        }
    },
    template: `
        <el-card class="box-card">
            <div slot="header" class="clearfix">
                <span>{{question.index}}(填空)</span>
                <el-button style="float: right; padding: 3px 0" type="text"
                            @click="deleteThisQuestion">移除
                </el-button>
            </div>
            <div>
                <!--todo 调整格式-->
                <!--禁用编辑按钮时的提示-->
                <el-alert title="本题目为系统预置，含有复杂逻辑，不支持编辑" type="warning" 
                        show-icon :closable="false" v-if="disableChangeStatus"></el-alert>
                <!--题目-->
                <div style="margin-bottom: 10px">
                    <el-input v-model="title" :disabled="disableEdit" placeholder="请输入题目描述"></el-input>
                </div>
                <div style="margin-bottom: 10px;height:35px;width:100%;">
                    <!--是否为隐私项-->
                    <el-switch v-model="isPrivate" :disabled="disableEdit" 
                                active-text="隐私项" inactive-text="非隐私项"style="margin-left:0px;margin-right: 8px"
                                active-color="#13ce66" inactive-color="#ff4949"></el-switch>
                    <!--是否必填-->
                    <el-switch v-model="isRequired" :disabled="disableEdit" 
                                active-text="必填项" inactive-text="非必填项" style="margin-left:0px;margin-right: 8px"
                                active-color="#13ce66" inactive-color="#ff4949"></el-switch>
                    <!--是否启用数据验证-->
                    <el-switch v-model="enableValidation" :disabled="disableEdit" 
                                style="margin-left:0px;margin-right: 8px" active-text="启用数据验证" inactive-text="关闭数据验证"
                                active-color="#13ce66" inactive-color="#ff4949"></el-switch>
                    <!--是否启用跳题逻辑-->
                    <el-switch v-model="enableFrontOptions" :disabled="disableEdit" 
                                style="margin-left:0px;margin-right: 8px" active-text="启用跳题逻辑" inactive-text="关闭跳题逻辑"
                                active-color="#13ce66" inactive-color="#ff4949"></el-switch>
                </div>
                <!--数据验证选项-->
                <div v-if="enableValidation"style="width:490px;margin-bottom: 15px;">
                    数据验证选项
                    <el-select v-model="validation" :disabled="disableEdit">
                        <el-option v-for="item in validationType" :key="item.type" :label="item.text" :value="item.type"></el-option>
                    </el-select>
                </div>
                <!--跳题逻辑设置-->
                <div v-if="enableFrontOptions"style="width:100%;margin-bottom: 15px;">
                    当<strong>题目</strong>
                    <el-select v-model="selectedQuestionId" :disabled="disableEdit">
                        <el-option v-for="item in list" :key="item.id" :label="item.title" :value="item.id"
                                    v-if="item.submitted && ['my-single', 'my-multiple', 'my-select'].indexOf(item.type) != -1">
                        </el-option>
                    </el-select>
                    的<strong>选项</strong>
                    <el-select v-model="selectedOption" :disabled="disableEdit" v-if="selectedQuestionId != ''">
                        <el-option v-for="item in selectedQuestion.answerList" :key="item.index" 
                                    :label="item.content" :value="item.index"></el-option>
                    </el-select>
                    选中时，显示此题目
                </div>
                
                <div style=";margin-top:10px">
                    <!--提交/编辑本题-->
                    <el-button style="width: 100%":type="buttonType" @click="changeStatus" :disabled="disableChangeStatus">{{buttonText}}</el-button>
                </div>
            </div>
        </el-card>
    `,
    methods: {
        deleteThisQuestion: function () {
            let idx = this.question.index;
            this.$emit('delete-question-by-index', idx)
        },
        changeStatus: function () {
            if (this.disableEdit) {
                this.$emit('revert-this-question', this.question);
                this.disableEdit = false
            } else {
                this.question.title = this.title;
                this.question.isRequired = this.isRequired;
                this.question.answerList = this.answerList;
                this.question.isPrivate = this.isPrivate;

                if (!this.enableFrontOptions) {
                    this.selectedQuestionId = ''
                    this.selectedOption = ''
                    this.question.frontOptions = []
                } else {
                    this.question.frontOptions = [{
                        questionId: this.selectedQuestionId,
                        questionAnswer: this.selectedOption
                    }];
                    if (this.multipleFrontOptions)
                        this.question.frontOptions.push(this.furtherOption)
                }

                if (!this.enableValidation)
                    this.validation = ''
                this.question.validation = this.validation;


                this.$emit('submit-this-question', this.question);
                this.disableEdit = true
            }
        }
    },
    computed: {
        buttonText: function () {
            return this.disableEdit ? '编辑' : '确定'
        },
        buttonType: function () {
            return this.disableEdit ? 'warning' : 'primary'
        },
        selectedQuestion: function () {
            for (let i = 0; i < this.list.length; i++) {
                if (this.selectedQuestionId === this.list[i].id)
                    return this.list[i]
            }
        }
    },
    created: function () {
        if (this.question.submitted) {
            this.disableEdit = false;
            this.enableFrontOptions = !!this.question.frontOptions.length;
            this.multipleFrontOptions = this.question.frontOptions.length > 1;
            if (this.enableFrontOptions) {
                this.selectedQuestionId = this.question.frontOptions[0].questionId;
                this.selectedOption = this.question.frontOptions[0].questionAnswer;
            }
            if (this.multipleFrontOptions) {
                this.furtherOption = this.question.frontOptions[1];
                this.disableChangeStatus = true;
            }
            this.enableValidation = this.question.validation !== '';
            this.title = this.question.title;
            this.isRequired = this.question.isRequired;
            this.frontOptions = this.question.frontOptions;
            this.validation = this.question.validation;
            this.isPrivate = this.question.isPrivate;
            this.changeStatus();
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
            disableEdit: false,
            enableFrontOptions: false,
            selectedQuestionId: '',
            selectedOption: '',
            //题目属性
            title: this.question.title,
            answerList: [{index: '选项A', content: ''}, {index: '选项B', content: ''}],
            isRequired: this.question.isRequired,
            frontOptions: [],
            isPrivate: false
        }
    },
    template: `
        <el-card class="box-card">
            <div slot="header" class="clearfix">
                <span>{{question.index}}(排序)</span>
                <el-button style="float: right; padding: 3px 0" type="text"
                            @click="deleteThisQuestion">移除
                </el-button>
            </div>
            <div>
                <!--todo 调整格式-->
                <!--题目-->
                <div style="margin-bottom: 10px">
                    <el-input v-model="title" :disabled="disableEdit" placeholder="请输入题目描述"></el-input>
                </div>
                 <!--各选项内容-->
                <div style="margin-bottom: 10px">
                    <el-input v-for="item in answerList" v-model="item.content"
                                :placeholder="item.index" :disabled="disableEdit"></el-input>
                </div>
                <div style="height:50px;width: 100%;margin-bottom: 10px;">
                    <!--添加选项-->
                    <el-button type="primary" icon="el-icon-plus" circle @click="addContent"
                                :disabled="disableEdit"></el-button>
                    <!--移除最后一个选项-->
                    <el-button type="danger" icon="el-icon-minus" circle @click="deleteContent"
                                :disabled="disableEdit || answerList.length<=2"></el-button>
                    <!--是否为隐私项-->
                    <el-switch v-model="isPrivate" :disabled="disableEdit" 
                                active-text="隐私项" inactive-text="非隐私项"style="margin-left:20px;margin-right: 10px"
                                active-color="#13ce66" inactive-color="#ff4949"></el-switch>
                    <!--是否必填-->
                    <el-switch v-model="isRequired" :disabled="disableEdit" 
                                active-text="必填项" inactive-text="非必填项" style="margin-left:20px;margin-right: 10px"
                                active-color="#13ce66" inactive-color="#ff4949"></el-switch>
                    <!--是否启用跳题逻辑-->
                    <el-switch v-model="enableFrontOptions" :disabled="disableEdit" 
                                style="margin-left:20px;margin-right: 10px" active-text="启用跳题逻辑" inactive-text="关闭跳题逻辑"
                                active-color="#13ce66" inactive-color="#ff4949"></el-switch>
                </div>
                <!--跳题逻辑设置-->
                <div v-if="enableFrontOptions" style="width:100%;margin-top: 15px;">
                    当<strong>题目</strong>
                    <el-select v-model="selectedQuestionId" :disabled="disableEdit">
                        <el-option v-for="item in list" :key="item.id" :label="item.title" :value="item.id"
                                    v-if="item.submitted && ['my-single', 'my-multiple', 'my-select'].indexOf(item.type) != -1">
                        </el-option>
                    </el-select>
                    的<strong>选项</strong>
                    <el-select v-model="selectedOption" :disabled="disableEdit" v-if="selectedQuestionId != ''">
                        <el-option v-for="item in selectedQuestion.answerList" :key="item.index" 
                                    :label="item.content" :value="item.index"></el-option>
                    </el-select>
                    选中时，显示此题目
                </div>
                <div style=";margin-top: 15px">
                    <!--提交/编辑本题-->
                    <el-button style="width: 100%":type="buttonType" @click="changeStatus">{{buttonText}}</el-button>
                </div>
            </div>
        </el-card>
    `,
    methods: {
        deleteThisQuestion: function () {
            let idx = this.question.index;
            this.$emit('delete-question-by-index', idx)
        },
        changeStatus: function () {
            if (this.disableEdit) {
                this.$emit('revert-this-question', this.question);
                this.disableEdit = false
            } else {
                this.question.title = this.title;
                this.question.isRequired = this.isRequired;
                this.question.answerList = this.answerList;
                this.question.isPrivate = this.isPrivate;

                if (!this.enableFrontOptions) {
                    this.selectedQuestionId = ''
                    this.selectedOption = ''
                    this.question.frontOptions = []
                } else {
                    this.question.frontOptions = [{
                        questionId: this.selectedQuestionId,
                        questionAnswer: this.selectedOption
                    }];
                }


                this.$emit('submit-this-question', this.question);
                this.disableEdit = true
            }
        },
        addContent: function () {
            let n = this.answerList.length;
            this.answerList.push({index: '选项' + String.fromCharCode(65 + n), content: ''});
        },
        deleteContent: function () {
            if (this.answerList.length <= 2)
                return;
            this.answerList.pop();
        }
    },
    computed: {
        buttonText: function () {
            return this.disableEdit ? '编辑' : '确定'
        },
        buttonType: function () {
            return this.disableEdit ? 'warning' : 'primary'
        },
        selectedQuestion: function () {
            for (let i = 0; i < this.list.length; i++) {
                if (this.selectedQuestionId === this.list[i].id)
                    return this.list[i]
            }
        }
    }
})

let app = new Vue({
    el: '#app',
    data: {
        auth: {
            userInfo: null,
            showWindow: false
        },
        urls: {
            post: serverUrl + '/api/survey/insertOrUpdateSurvey',
        },
        questionCount: 0,
        groupCount: 0,
        survey: {
            title: '',
            description: '',
            questions: []
        }
    },
    //注册组件
    components: {
        'my-single': mySingleQuestion,
        'my-multiple': myMultipleQuestion,
        'my-fill-blank': myBlankQuestion,
        'my-order': myOrderQuestion,
    },
    methods: {
        addBasicQuestion: function (questionType) {
            let newQuestion = {
                //前端使用
                id: '#' + this.questionCount,
                groupId: '',
                submitted: false,
                //传至后端
                title: '',
                index: this.survey.questions.length + 1,
                type: questionType,
                isRequired: true,
                defaultAns: '',
                answerList: [],
                frontOptions: [],
                skipLogices: [],
                validation: '',
                isPrivate: false
            }
            this.survey.questions.push(newQuestion)
            this.questionCount++
        },
        addMobilePhone: function () {
            let newQuestion = {
                //前端使用
                id: '#' + this.questionCount,
                groupId: '',
                submitted: true,
                //传至后端
                title: '手机号',
                index: this.survey.questions.length + 1,
                type: 'my-fill-blank',
                isRequired: true,
                defaultAns: '',
                answerList: [],
                frontOptions: [],
                skipLogices: [],
                validation: 'phone',
                isPrivate: true
            }
            this.survey.questions.push(newQuestion)
            this.questionCount++
        },
        addApplication: function () {
            let question1 = {
                //前端使用
                id: '#' + this.questionCount,
                groupId: '$' + this.groupCount,
                submitted: true,
                //传至后端
                title: '平行志愿报考北京理工大学顺序',
                index: this.survey.questions.length + 1,
                type: 'my-single',
                isRequired: true,
                defaultAns: '',
                answerList: [{index: '选项A', content: 'A志愿'},
                    {index: '选项B', content: 'B志愿'},
                    {index: '选项C', content: 'C志愿'},
                    {index: '选项D', content: '其他'},],
                frontOptions: [],
                skipLogices: [],
                validation: '',
                isPrivate: false
            };
            this.survey.questions.push(question1)
            this.questionCount++

            let question2 = {
                //前端使用
                id: '#' + this.questionCount,
                groupId: '$' + this.groupCount,
                submitted: true,
                //传至后端
                title: '请填写A志愿学校名称',
                index: this.survey.questions.length + 1,
                type: 'my-fill-blank',
                isRequired: true,
                defaultAns: '',
                answerList: [],
                frontOptions: [{questionId: '#' + (this.questionCount - 1), questionAnswer: '选项B'},
                    {questionId: '#' + (this.questionCount - 1), questionAnswer: '选项C'}],
                skipLogices: [],
                validation: '',
                isPrivate: false
            }
            this.survey.questions.push(question2)
            this.questionCount++

            let question3 = {
                //前端使用
                id: '#' + this.questionCount,
                groupId: '$' + this.groupCount,
                submitted: true,
                //传至后端
                title: '请填写B志愿学校名称',
                index: this.survey.questions.length + 1,
                type: 'my-fill-blank',
                isRequired: true,
                defaultAns: '',
                answerList: [],
                frontOptions: [{
                    questionId: '#' + (this.questionCount - 2),
                    questionAnswer: '选项C'
                }],
                skipLogices: [],
                validation: '',
                isPrivate: false
            }
            this.survey.questions.push(question3)
            this.questionCount++

            let question4 = {
                //前端使用
                id: '#' + this.questionCount,
                groupId: '$' + this.groupCount,
                submitted: true,
                //传至后端
                title: '请填写报考北京理工大学的院校顺序',
                index: this.survey.questions.length + 1,
                type: 'my-single',
                isRequired: true,
                defaultAns: '',
                answerList: [{index: '选项A', content: 'D志愿'},
                    {index: '选项B', content: 'E志愿'},
                    {index: '选项C', content: 'F志愿'}],
                frontOptions: [{
                    questionId: '#' + (this.questionCount - 3),
                    questionAnswer: '选项D'
                }],
                skipLogices: [],
                validation: '',
                isPrivate: false
            };
            this.survey.questions.push(question4)
            this.questionCount++
            this.groupCount++
        },
        addSpecialPlan: function () {
            let single = {
                //前端使用
                id: '#' + this.questionCount,
                groupId: '$' + this.groupCount,
                submitted: true,
                //传至后端
                title: '是否报考其他学校的强基计划或国家专项',
                index: this.survey.questions.length + 1,
                type: 'my-single',
                isRequired: true,
                defaultAns: '',
                answerList: [{index: '选项A', content: '是'}, {index: '选项B', content: '否'}],
                frontOptions: [],
                skipLogices: [],
                validation: '',
                isPrivate: false
            };
            this.survey.questions.push(single)
            this.questionCount++

            let plan = {
                //前端使用
                id: '#' + this.questionCount,
                groupId: '$' + this.groupCount,
                submitted: true,
                //传至后端
                title: '报考类别',
                index: this.survey.questions.length + 1,
                type: 'my-single',
                isRequired: true,
                defaultAns: '',
                answerList: [{index: '选项A', content: '强基计划'}, {index: '选项B', content: '国家专项'}],
                frontOptions: [{
                    questionId: '#' + (this.questionCount - 1),
                    questionAnswer: '选项A'
                }],
                skipLogices: [],
                validation: '',
                isPrivate: false
            };
            this.survey.questions.push(plan)
            this.questionCount++

            let fillBlank = {
                //前端使用
                id: '#' + this.questionCount,
                groupId: '$' + this.groupCount,
                submitted: true,
                //传至后端
                title: '报考学校名称',
                index: this.survey.questions.length + 1,
                type: 'my-fill-blank',
                isRequired: true,
                defaultAns: '',
                answerList: [],
                frontOptions: [{
                    questionId: '#' + (this.questionCount - 2),
                    questionAnswer: '选项A'
                }],
                skipLogices: [],
                validation: '',
                isPrivate: false
            };
            this.survey.questions.push(fillBlank)
            this.questionCount++
            this.groupCount++
        },
        deleteQuestionByIndex: function (index) {
            console.log('index', index - 1);
            this.$confirm('确认移除此题目', '警告', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                //根据index移除题目
                let flag = this.survey.questions[index - 1].groupId
                console.log('flag', flag)
                this.survey.questions.splice(index - 1, 1);

                //移除整套问题
                if (flag !== '') {
                    let toRemove = []
                    let newList = []
                    for (let i = 0; i < this.survey.questions.length; i++) {
                        if (this.survey.questions[i].groupId === flag)
                            toRemove.push(i)
                    }
                    console.log(toRemove)
                    for (let i = 0; i < this.survey.questions.length; i++) {
                        if (toRemove.indexOf(i) === -1)
                            newList.push(this.survey.questions[i])
                    }
                    this.survey.questions = newList
                }

                //对剩下的题目重新标号
                for (let i = 0; i < this.survey.questions.length; i++) {
                    this.survey.questions[i].index = i + 1;
                }
            });
        },
        revertQuestionByIndex: function (question) {
            this.survey.questions[question.index - 1].submitted = false;
        },
        submitQuestionByIndex: function (question) {
            question.submitted = true;
            this.survey.questions[question.index - 1] = question;
        },
        submitSurvey: function () {
            for (let i = 0; i < this.survey.questions.length; i++)
                if (!this.survey.questions[i].submitted) {
                    this.$message.error('您还有未编辑完成的题目，请编辑后提交');
                    return
                }
            this.$confirm('确认提交？提交后将不能修改', '警告', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                let data = JSON.parse(JSON.stringify(this.survey))
                data.ownerId = this.auth.userInfo.id
                data.enable = true

                data.questions.forEach(function (item) {
                    delete item.groupId
                    delete item.submitted

                    if (item.type !== 'my-fill-blank') {
                        let newList = []
                        item.answerList.forEach(function (i) {
                            newList.push(i.content)
                        })
                        item.answerList = newList
                    }

                    if (item.frontOptions.length > 0) {
                        item.frontOptions.forEach(function (i) {
                            let index = i.questionAnswer
                            i.questionAnswer = index.charAt(index.length - 1).charCodeAt() - 'A'.charCodeAt()
                        })
                    }

                    switch (item.type) {
                        case 'my-single':
                            item.type = 'SINGLE';
                            break;
                        case 'my-multiple':
                            item.type = 'MULTIPLE';
                            break;
                        case 'my-fill-blank':
                            item.type = 'FILL_BLANK';
                            break;
                        case 'my-order':
                            item.type = 'ORDER';
                            break;
                    }
                })
                console.log(JSON.stringify(data))
                let app = this
                ajaxPostJSON(this.urls.post, data,
                    function (r) {
                        if (r.code === 'success')
                            app.$message({
                                message: '创建成功',
                                type: 'success'
                            })
                    }, function () {

                    })
                //todo 跳转到详情页，待管理员启用
                console.log('页面跳转')
            });
        }
    },
    created: function () {
        this.auth.userInfo = JSON.parse(getSessionStorage('user'))
        if (this.auth.userInfo == null) {
            this.$message({
                message: "请登录",
                type: 'error'
            });
            return
        }
        if (this.auth.userInfo.role === 'admin') {
            this.auth.showWindow = true
            return
        }
        this.$message({
            message: "您无权访问当前页面",
            type: 'error'
        });
    }
})