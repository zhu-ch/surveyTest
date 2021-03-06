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
            required: this.question.required,
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
                    <el-switch v-model="required" :disabled="disableEdit" 
                                active-text="必填项" inactive-text="非必填项" style="margin-left:20px;margin-right: 10px"
                                active-color="#13ce66" inactive-color="#ff4949"></el-switch>
                    <!--是否启用题目关联-->
                    <el-switch v-model="enableFrontOptions" :disabled="disableEdit" 
                    style="margin-left:20px;margin-right: 10px" active-text="启用题目关联" inactive-text="关闭题目关联"
                                active-color="#13ce66" inactive-color="#ff4949"></el-switch>
                </div>
                <!--题目关联设置-->
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
                this.question.required = this.required;
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
            this.required = this.question.required;
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
            required: this.question.required,
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
                    <el-switch v-model="required" :disabled="disableEdit" 
                                active-text="必填项" inactive-text="非必填项" style="margin-left:20px;margin-right: 10px"
                                active-color="#13ce66" inactive-color="#ff4949"></el-switch>
                    <!--是否启用题目关联-->
                    <el-switch v-model="enableFrontOptions" :disabled="disableEdit" 
                                style="margin-left:20px;margin-right: 10px" active-text="启用题目关联" inactive-text="关闭题目关联"
                                active-color="#13ce66" inactive-color="#ff4949"></el-switch>
                </div>
                <!--题目关联设置-->
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
                this.question.required = this.required;
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
            this.required = this.question.required;
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
        },
        'config': {
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

            //题目属性
            title: this.question.title,
            required: this.question.required,
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
                    <el-switch v-model="required" :disabled="disableEdit" 
                                active-text="必填项" inactive-text="非必填项" style="margin-left:0px;margin-right: 8px"
                                active-color="#13ce66" inactive-color="#ff4949"></el-switch>
                    <!--是否启用数据验证-->
                    <el-switch v-model="enableValidation" :disabled="disableEdit" 
                                style="margin-left:0px;margin-right: 8px" active-text="启用数据验证" inactive-text="关闭数据验证"
                                active-color="#13ce66" inactive-color="#ff4949"></el-switch>
                    <!--是否启用题目关联-->
                    <el-switch v-model="enableFrontOptions" :disabled="disableEdit" 
                                style="margin-left:0px;margin-right: 8px" active-text="启用题目关联" inactive-text="关闭题目关联"
                                active-color="#13ce66" inactive-color="#ff4949"></el-switch>
                </div>
                <!--数据验证选项-->
                <div v-if="enableValidation"style="width:490px;margin-bottom: 15px;">
                    数据验证选项
                    <el-select v-model="validation" :disabled="disableEdit">
                        <el-option v-for="item in validationType" :key="item.type" :label="item.text" :value="item.type"></el-option>
                    </el-select>
                </div>
                <!--题目关联设置-->
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
                this.question.required = this.required;
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
        },
        validationType: function () {
            let ret = [
                {type: 'phone', text: '手机号'},
                {type: 'integer', text: '整数'}
            ]
            this.config.forEach(function (item) {
                ret.push({type: item, key: item})
            })
            return ret
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
            this.required = this.question.required;
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
            required: this.question.required,
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
                    <el-switch v-model="required" :disabled="disableEdit" 
                                active-text="必填项" inactive-text="非必填项" style="margin-left:20px;margin-right: 10px"
                                active-color="#13ce66" inactive-color="#ff4949"></el-switch>
                    <!--是否启用题目关联-->
                    <el-switch v-model="enableFrontOptions" :disabled="disableEdit" 
                                style="margin-left:20px;margin-right: 10px" active-text="启用题目关联" inactive-text="关闭题目关联"
                                active-color="#13ce66" inactive-color="#ff4949"></el-switch>
                </div>
                <!--题目关联设置-->
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
                this.question.required = this.required;
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
            getConfigKey: serverUrl + '/api/sys/config/getConfigTypeList'
        },
        questionCount: 0,
        groupCount: 0,
        survey: {
            title: '',
            description: '',
            questions: []
        },
        configKey: [],
        fullScreenLoading: false
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
                id: uuid(),
                groupId: '',
                submitted: false,
                //传至后端
                title: '',
                index: this.survey.questions.length + 1,
                type: questionType,
                required: true,
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
                id: uuid(),
                groupId: '',
                submitted: true,
                //传至后端
                title: '手机号',
                index: this.survey.questions.length + 1,
                type: 'my-fill-blank',
                required: true,
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
            let firstID=uuid()
            let secondId=uuid()
            let thirdId=uuid()
            let fourthId=uuid()

            let question1 = {
                //前端使用
                id: firstID,
                groupId: '$' + this.groupCount,
                submitted: true,
                //传至后端
                title: '平行志愿报考北京理工大学顺序',
                index: this.survey.questions.length + 1,
                type: 'my-single',
                required: true,
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
                id: secondId,
                groupId: '$' + this.groupCount,
                submitted: true,
                //传至后端
                title: '请填写A志愿学校名称',
                index: this.survey.questions.length + 1,
                type: 'my-fill-blank',
                required: true,
                defaultAns: '',
                answerList: [],
                frontOptions: [{questionId: firstID, questionAnswer: '选项B'},
                    {questionId: firstID, questionAnswer: '选项C'}],
                skipLogices: [],
                validation: '',
                isPrivate: false
            }
            this.survey.questions.push(question2)
            this.questionCount++

            let question3 = {
                //前端使用
                id: thirdId,
                groupId: '$' + this.groupCount,
                submitted: true,
                //传至后端
                title: '请填写B志愿学校名称',
                index: this.survey.questions.length + 1,
                type: 'my-fill-blank',
                required: true,
                defaultAns: '',
                answerList: [],
                frontOptions: [{
                    questionId: firstID,
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
                id: fourthId,
                groupId: '$' + this.groupCount,
                submitted: true,
                //传至后端
                title: '请填写报考北京理工大学的院校顺序',
                index: this.survey.questions.length + 1,
                type: 'my-single',
                required: true,
                defaultAns: '',
                answerList: [{index: '选项A', content: 'D志愿'},
                    {index: '选项B', content: 'E志愿'},
                    {index: '选项C', content: 'F志愿'}],
                frontOptions: [{
                    questionId: firstID,
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
        addNationalPlan: function () {
            let firstId=uuid()
            let single = {
                //前端使用
                id: firstId,
                groupId: '$' + this.groupCount,
                submitted: true,
                //传至后端
                title: '是否报考其他学校的国家专项',
                index: this.survey.questions.length + 1,
                type: 'my-single',
                required: true,
                defaultAns: '',
                answerList: [{index: '选项A', content: '是'}, {index: '选项B', content: '否'}],
                frontOptions: [],
                skipLogices: [],
                validation: '',
                isPrivate: false
            };
            this.survey.questions.push(single)
            this.questionCount++

            let fillBlank = {
                //前端使用
                id: uuid(),
                groupId: '$' + this.groupCount,
                submitted: true,
                //传至后端
                title: '报考学校名称',
                index: this.survey.questions.length + 1,
                type: 'my-fill-blank',
                required: true,
                defaultAns: '',
                answerList: [],
                frontOptions: [{
                    questionId: firstId,
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
        addBasicPlan: function () {
            let firstId=uuid()
            let single = {
                //前端使用
                id: firstId,
                groupId: '$' + this.groupCount,
                submitted: true,
                //传至后端
                title: '是否报考其他学校的强基计划',
                index: this.survey.questions.length + 1,
                type: 'my-single',
                required: true,
                defaultAns: '',
                answerList: [{index: '选项A', content: '是'}, {index: '选项B', content: '否'}],
                frontOptions: [],
                skipLogices: [],
                validation: '',
                isPrivate: false
            };
            this.survey.questions.push(single)
            this.questionCount++

            let fillBlank = {
                //前端使用
                id: uuid(),
                groupId: '$' + this.groupCount,
                submitted: true,
                //传至后端
                title: '报考学校名称',
                index: this.survey.questions.length + 1,
                type: 'my-fill-blank',
                required: true,
                defaultAns: '',
                answerList: [],
                frontOptions: [{
                    questionId: firstId,
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
        addAdvanceApproval: function () {
            let firstId=uuid()
            let single = {
                //前端使用
                id: firstId,
                groupId: '$' + this.groupCount,
                submitted: true,
                //传至后端
                title: '是否填报提前批',
                index: this.survey.questions.length + 1,
                type: 'my-single',
                required: true,
                defaultAns: '',
                answerList: [{index: '选项A', content: '是'}, {index: '选项B', content: '否'}],
                frontOptions: [],
                skipLogices: [],
                validation: '',
                isPrivate: false
            };
            this.survey.questions.push(single)
            this.questionCount++

            let fillBlank = {
                //前端使用
                id: uuid(),
                groupId: '$' + this.groupCount,
                submitted: true,
                //传至后端
                title: '报考学校名称',
                index: this.survey.questions.length + 1,
                type: 'my-fill-blank',
                required: true,
                defaultAns: '',
                answerList: [],
                frontOptions: [{
                    questionId: firstId,
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
        addOath: function () {
            let single = {
                //前端使用
                id: uuid(),
                groupId: '$' + this.groupCount,
                submitted: true,
                //传至后端
                title: '我承诺上述信息与提供给我所在省招办信息一致',
                index: this.survey.questions.length + 1,
                type: 'my-single',
                required: true,
                defaultAns: '',
                answerList: [{index: '选项A', content: '是'}],
                frontOptions: [],
                skipLogices: [],
                validation: '',
                isPrivate: false
            };
            this.survey.questions.push(single)
            this.questionCount++
        },
        addIdentity: function () {
            let single = {
                //前端使用
                id: uuid(),
                groupId: '$' + this.groupCount,
                submitted: true,
                //传至后端
                title: '我是考生的',
                index: this.survey.questions.length + 1,
                type: 'my-single',
                required: true,
                defaultAns: '',
                answerList: [{index: '选项A', content: '本人'}, {index: '选项B', content: '父亲'},
                    {index: '选项C', content: '母亲'}, {index: '选项D', content: '其他'}],
                frontOptions: [],
                skipLogices: [],
                validation: '',
                isPrivate: false
            };
            this.survey.questions.push(single)
            this.questionCount++
        },
        addSigned: function () {
            let single = {
                //前端使用
                id: uuid(),
                groupId: '$' + this.groupCount,
                submitted: true,
                //传至后端
                title: '是否与北京理工大学签约',
                index: this.survey.questions.length + 1,
                type: 'my-single',
                required: true,
                defaultAns: '',
                answerList: [{index: '选项A', content: '是'}, {index: '选项B', content: '否'}],
                frontOptions: [],
                skipLogices: [],
                validation: '',
                isPrivate: false
            };
            this.survey.questions.push(single)
            this.questionCount++
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
            if (this.survey.title === '') {
                this.$message.error('请填写问卷标题');
                return;
            }
            this.$confirm('确认提交？提交后将不能修改', '警告', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                let data = JSON.parse(JSON.stringify(this.survey))
                data.ownerId = this.auth.userInfo.id
                data.enable = false

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
                let app = this
                app.fullScreenLoading = true
                ajaxPostJSON(this.urls.post, data,
                    function (r) {
                        if (r.code === 'success') {
                            app.fullScreenLoading = false
                            app.$message({
                                message: '创建成功，3秒后关闭页面',
                                type: 'success'
                            })
                            setTimeout(function () {
                                window.parent.postMessage({
                                    data: {
                                        type: "closeCreateSurvey"
                                    }
                                }, '*')
                                window.parent.postMessage({
                                    data: {
                                        type: "addSurveyManagement"
                                    }
                                }, '*')
                            }, 3000)
                        }
                    }, function () {
                        app.fullScreenLoading = false
                        console.log('error')
                    })
            });
        }
    },
    created: function () {
        this.auth.userInfo = JSON.parse(getSessionStorage('user'))
        // this.auth.userInfo = {role: 'admin'}

        if (this.auth.userInfo == null) {
            this.$message({
                message: "请登录",
                type: 'error'
            });
            return
        }
        if (this.auth.userInfo.role === 'admin') {
            this.auth.showWindow = true
            let app = this
            ajaxGet(this.urls.getConfigKey, null,
                function (result) {
                    app.configKey = result.data
                }, function () {

                }, false)
            return
        }
        this.$message({
            message: "您无权访问当前页面",
            type: 'error'
        });
    }
})

function uuid() {
    let withLine = true; //带不带横线
    let len = 36; //长度为36
    let radix = 16; //16进制
    let chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
    let uuid = [], i;
    radix = radix || chars.length;
    if (withLine) {
        let r;
        uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
        uuid[14] = '4';
        for (i = 0; i < len; i++) {
            if (!uuid[i]) {
                r = 0 | Math.random() * 16;
                uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
            }
        }
    } else {
        for (i = 0; i < len; i++) {
            uuid[i] = chars[0 | Math.random() * radix];
        }
    }
    return uuid.join('');
}