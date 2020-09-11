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
                <!--题目-->
                <el-input v-model="title" :disabled="disableEdit" placeholder="请输入题目描述"></el-input>
                <!--是否为隐私项-->
                <el-switch v-model="isPrivate" :disabled="disableEdit" 
                            active-color="#13ce66" inactive-color="#ff4949"></el-switch>
                <!--是否必填-->
                <el-switch v-model="isRequired" :disabled="disableEdit" 
                            active-color="#13ce66" inactive-color="#ff4949"></el-switch>
                <!--各选项内容-->
                <el-input v-for="item in answerList" v-model="item.content"
                            :placeholder="item.index" :disabled="disableEdit"></el-input>
                <!--添加选项-->
                <el-button type="primary" icon="el-icon-plus" circle @click="addContent"
                            :disabled="disableEdit"></el-button>
                <!--移除最后一个选项-->
                <el-button type="danger" icon="el-icon-minus" circle @click="deleteContent"
                            :disabled="disableEdit || answerList.length<=2"></el-button>
                <!--是否启用跳题逻辑-->
                <el-switch v-model="enableFrontOptions" :disabled="disableEdit" 
                            active-color="#13ce66" inactive-color="#ff4949"></el-switch>
                <!--跳题逻辑设置-->
                <div v-if="enableFrontOptions">
                    当<strong>题目</strong>
                    <el-select v-model="selectedQuestionId" :disabled="disableEdit">
                        <el-option v-for="item in list" :key="item.id" :label="item.title" :value="item.id"
                                    v-if="item.submitted && ['my-single', 'my-multiple', 'my-select'].indexOf(item.type) != -1">
                        </el-option>
                    </el-select>
                    的<strong>选项</strong>
                    <el-select v-model="selectedOption" :disabled="disableEdit" v-if="selectedQuestionId != ''">
                        <el-option v-for="item in selectedQuestion.answerList" :key="item.index" 
                                    :label="item.content" :value="item.content"></el-option>
                    </el-select>
                    选中时，显示此题目
                </div>
                <!--提交/编辑本题-->
                <el-button :type="buttonType" @click="changeStatus">{{buttonText}}</el-button>
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
                        question_id: this.selectedQuestion.index - 1,
                        question_answer: this.selectedOption
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
            for (let i = 0; i < this.list.length; i++)
                if (this.list[i].id === this.selectedQuestionId)
                    return this.list[i]
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
                <!--题目-->
                <el-input v-model="title" :disabled="disableEdit" placeholder="请输入题目描述"></el-input>
                <!--是否为隐私项-->
                <el-switch v-model="isPrivate" :disabled="disableEdit" 
                            active-color="#13ce66" inactive-color="#ff4949"></el-switch>
                <!--是否必填-->
                <el-switch v-model="isRequired" :disabled="disableEdit" 
                            active-color="#13ce66" inactive-color="#ff4949"></el-switch>
                <!--各选项内容-->
                <el-input v-for="item in answerList" v-model="item.content"
                            :placeholder="item.index" :disabled="disableEdit"></el-input>
                <!--添加选项-->
                <el-button type="primary" icon="el-icon-plus" circle @click="addContent"
                            :disabled="disableEdit"></el-button>
                <!--移除最后一个选项-->
                <el-button type="danger" icon="el-icon-minus" circle @click="deleteContent"
                            :disabled="disableEdit || answerList.length<=2"></el-button>
                <!--是否启用跳题逻辑-->
                <el-switch v-model="enableFrontOptions" :disabled="disableEdit" 
                            active-color="#13ce66" inactive-color="#ff4949"></el-switch>
                <!--跳题逻辑设置-->
                <div v-if="enableFrontOptions">
                    当<strong>题目</strong>
                    <el-select v-model="selectedQuestionId" :disabled="disableEdit">
                        <el-option v-for="item in list" :key="item.id" :label="item.title" :value="item.id"
                                    v-if="item.submitted && ['my-single', 'my-multiple', 'my-select'].indexOf(item.type) != -1">
                        </el-option>
                    </el-select>
                    的<strong>选项</strong>
                    <el-select v-model="selectedOption" :disabled="disableEdit" v-if="selectedQuestionId != ''">
                        <el-option v-for="item in selectedQuestion.answerList" :key="item.index" 
                                    :label="item.content" :value="item.content"></el-option>
                    </el-select>
                    选中时，显示此题目
                </div>
                <!--提交/编辑本题-->
                <el-button :type="buttonType" @click="changeStatus">{{buttonText}}</el-button>
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
                        question_id: this.selectedQuestion.index - 1,
                        question_answer: this.selectedOption
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
            for (let i = 0; i < this.list.length; i++)
                if (this.list[i].id === this.selectedQuestionId)
                    return this.list[i]
        }
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
            disableEdit: false,
            enableFrontOptions: false,
            selectedQuestionId: '',
            selectedOption: '',
            enableValidation: false,
            validationType: [
                {type: 'phone', text: '手机号'},
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
                <!--题目-->
                <el-input v-model="title" :disabled="disableEdit" placeholder="请输入题目描述"></el-input>
                <!--是否为隐私项-->
                <el-switch v-model="isPrivate" :disabled="disableEdit" 
                            active-color="#13ce66" inactive-color="#ff4949"></el-switch>
                <!--是否必填-->
                <el-switch v-model="isRequired" :disabled="disableEdit" 
                            active-color="#13ce66" inactive-color="#ff4949"></el-switch>
                <!--是否启用跳题逻辑-->
                <el-switch v-model="enableFrontOptions" :disabled="disableEdit" 
                            active-color="#13ce66" inactive-color="#ff4949"></el-switch>
                <!--是否启用数据验证-->
                <el-switch v-model="enableValidation" :disabled="disableEdit" 
                            active-color="#13ce66" inactive-color="#ff4949"></el-switch>
                <!--数据验证选项-->
                <div v-if="enableValidation">
                    数据验证选项
                    <el-select v-model="validation" :disabled="disableEdit">
                        <el-option v-for="item in validationType" :key="item.type" :label="item.text" :value="item.type"></el-option>
                    </el-select>
                </div>
                <!--跳题逻辑设置-->
                <div v-if="enableFrontOptions">
                    当<strong>题目</strong>
                    <el-select v-model="selectedQuestionId" :disabled="disableEdit">
                        <el-option v-for="item in list" :key="item.id" :label="item.title" :value="item.id"
                                    v-if="item.submitted && ['my-single', 'my-multiple', 'my-select'].indexOf(item.type) != -1">
                        </el-option>
                    </el-select>
                    的<strong>选项</strong>
                    <el-select v-model="selectedOption" :disabled="disableEdit" v-if="selectedQuestionId != ''">
                        <el-option v-for="item in selectedQuestion.answerList" :key="item.index" 
                                    :label="item.content" :value="item.content"></el-option>
                    </el-select>
                    选中时，显示此题目
                </div>
                <!--提交/编辑本题-->
                <el-button :type="buttonType" @click="changeStatus">{{buttonText}}</el-button>
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
                        question_id: this.selectedQuestion.index - 1,
                        question_answer: this.selectedOption
                    }];
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
            for (let i = 0; i < this.list.length; i++)
                if (this.list[i].id === this.selectedQuestionId)
                    return this.list[i]
        }
    },
    created: function () {
        if (this.question.validation !== '') {
            this.enableValidation = true;
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
                <el-input v-model="title" :disabled="disableEdit" placeholder="请输入题目描述"></el-input>
                <!--是否为隐私项-->
                <el-switch v-model="isPrivate" :disabled="disableEdit" 
                            active-color="#13ce66" inactive-color="#ff4949"></el-switch>
                <!--是否必填-->
                <el-switch v-model="isRequired" :disabled="disableEdit" 
                            active-color="#13ce66" inactive-color="#ff4949"></el-switch>
                 <!--各选项内容-->
                <el-input v-for="item in answerList" v-model="item.content"
                            :placeholder="item.index" :disabled="disableEdit"></el-input>
                <!--添加选项-->
                <el-button type="primary" icon="el-icon-plus" circle @click="addContent"
                            :disabled="disableEdit"></el-button>
                <!--移除最后一个选项-->
                <el-button type="danger" icon="el-icon-minus" circle @click="deleteContent"
                            :disabled="disableEdit || answerList.length<=2"></el-button>
                <!--是否启用跳题逻辑-->
                <el-switch v-model="enableFrontOptions" :disabled="disableEdit" 
                            active-color="#13ce66" inactive-color="#ff4949"></el-switch>
                <!--跳题逻辑设置-->
                <div v-if="enableFrontOptions">
                    当<strong>题目</strong>
                    <el-select v-model="selectedQuestionId" :disabled="disableEdit">
                        <el-option v-for="item in list" :key="item.id" :label="item.title" :value="item.id"
                                    v-if="item.submitted && ['my-single', 'my-multiple', 'my-select'].indexOf(item.type) != -1">
                        </el-option>
                    </el-select>
                    的<strong>选项</strong>
                    <el-select v-model="selectedOption" :disabled="disableEdit" v-if="selectedQuestionId != ''">
                        <el-option v-for="item in selectedQuestion.answerList" :key="item.index" 
                                    :label="item.content" :value="item.content"></el-option>
                    </el-select>
                    选中时，显示此题目
                </div>
                <!--提交/编辑本题-->
                <el-button :type="buttonType" @click="changeStatus">{{buttonText}}</el-button>
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
                        question_id: this.selectedQuestion.index - 1,
                        question_answer: this.selectedOption
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
            for (let i = 0; i < this.list.length; i++)
                if (this.list[i].id === this.selectedQuestionId)
                    return this.list[i]
        }
    }
})

let app = new Vue({
    el: '#app',
    data: {
        questionCount: 0,
        survey: {
            surveyTitle: '',
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
        addDefaultQuestion: function (questionType, arg) {
            let newQuestion = {
                //前端使用
                id: '#' + this.questionCount,
                submitted: false,
                //传至后端
                title: '手机号',
                index: this.survey.questions.length + 1,
                type: questionType,
                isRequired: true,
                defaultAns: '',
                answerList: [],
                frontOptions: [],
                skipLogices: [],
                validation: arg,
                isPrivate: true
            }
            this.survey.questions.push(newQuestion)
            this.questionCount++
        },
        deleteQuestionByIndex: function (index) {
            console.log(index - 1);
            this.$confirm('确认移除此题目', '警告', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                //根据index移除题目
                this.survey.questions.splice(index - 1, 1);

                //对剩下的题目重新标号
                for (let i = 0; i < this.survey.questions.length; i++) {
                    this.survey.questions[i].index = i + 1;
                }

                console.log(this.survey.questions)
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
                //todo 向后端提交问卷
                console.log('调用提交API')
                //todo 跳转到详情页，待管理员启用
                console.log('页面跳转')
            });
        }
    },
    created: function () {
        //todo 根据cookie检查权限
    }
})