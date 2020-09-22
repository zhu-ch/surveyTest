let mySurveyFilter = Vue.extend({
    props: {
        'questions': {
            type: Array
        },
        'condition': {
            type: Object
        },
        'user': {
            type: Object
        }
    },
    template: `
        <div style="display: flex; margin: 5px 0 5px 0">
            <div style="display: flex; width: 80vw">
                <!--指定题目-->
                <el-select v-model="filterCondition.id" placeholder="请选择题目" @change="resetThis(); submitThis()">
                    <el-option v-for="item in questions" :key="item.id" :label="item.title" :value="item.id"
                            v-if="(item.type!='ORDER') && (user.role === 'admin' || user.role === 'leader' || item.isPrivate != true)">
                    </el-option>
                </el-select>
                <!--选择题筛选条件-->
                <el-select v-model="filterCondition.searchCondition" placeholder="请选择筛选条件" @change="submitThis"
                            v-if="selectedQuestion && selectedQuestion.type !== 'FILL_BLANK'">
                    <el-option v-for="item in choose" :key="item.value" :label="item.label" :value="item.value"></el-option>
                </el-select>
                <!--填空题筛选条件-->
                <el-select v-model="filterCondition.searchCondition" placeholder="请选择筛选条件" @change="submitThis"
                            v-if="selectedQuestion && selectedQuestion.type === 'FILL_BLANK'">
                    <el-option v-for="item in fill" :key="item.value" :label="item.label" :value="item.value"></el-option>
                </el-select>
                <!--选择题筛选项-->
                <el-select v-model="filterCondition.searchKey" placeholder="请选择筛选项" @change="submitThis"
                            v-if="selectedQuestion && selectedQuestion.type !== 'FILL_BLANK'">
                    <el-option v-for="(item, i) in selectedQuestion.answerList" :key="i" :label="item" :value="item"></el-option>
                </el-select>
                <!--填空题筛选项-->
                <el-input v-model="filterCondition.searchKey" placeholder="请填写筛选值" @change="submitThis"
                            v-if="selectedQuestion && selectedQuestion.type === 'FILL_BLANK'"></el-input>
            </div>
            <div>
                <el-button type="danger" icon="el-icon-minus" circle @click="deleteThis"></el-button>
            </div>
        </div>
    `,
    data() {
        return {
            filterCondition: {},
            choose: [{'label': '选择了', 'value': 'EQUAL'},
                {'label': '未选择', 'value': 'NOT_EQUAL'}
            ],
            fill: [{'label': '大于', 'value': 'GREATER'},
                {'label': '小于', 'value': 'LESS'},
                {'label': '等于', 'value': 'EQUAL'},
                {'label': '不等于', 'value': 'NOT_EQUAL'},
                {'label': '包含', 'value': 'CONTAIN'},
                {'label': '不包含', 'value': 'NOT_CONTAIN'}
            ]
        }
    },
    methods: {
        deleteThis: function () {
            this.$emit('delete-this-question', this.filterCondition.index);
        },
        submitThis: function () {
            if (!(this.filterCondition.id && this.filterCondition.searchCondition && this.filterCondition.searchKey))
                return
            this.$emit('submit-this-question', this.filterCondition);
        },
        resetThis: function () {
            this.filterCondition.searchCondition = ''
            this.filterCondition.searchKey = ''
        }
    },
    created: function () {
        this.filterCondition = JSON.parse(JSON.stringify(this.condition))
    },
    computed: {
        selectedQuestion: function () {
            for (let i = 0; i < this.questions.length; i++)
                if (this.questions[i].id === this.filterCondition.id)
                    return this.questions[i]
            return null
        }
    },
    watch: {
        condition(n, o) {
            this.filterCondition = JSON.parse(JSON.stringify(this.condition))

        }
    }
})

let app = new Vue({
    el: '#app',
    components: {
        'my-survey-filter': mySurveyFilter
    },
    data: {
        user: {},
        showWindow: false,
        fullScreenLoading: false,
        urls: {
            getAnsListByConditions: serverUrl + '/api/survey/data/getAnsListByConditions',
            getSurvey: serverUrl + '/api/survey/getSurveyByConditions',
            getExportId: serverUrl + '/api/survey/data/getExportId',
            exportExcel: serverUrl + '/api/survey/data/exportSurvey'

        },
        queryEntity: {
            userConditions: {
                high_school: '',
                year: '',
                subject: '',
                model: ''
            },
            surveyEntity: {
                id: '',
                questions: []
            },
            sortConditions: []
        },
        surveyTitle: '',
        table: {
            tableData: [],
            questionList: [],
        },
        filter: {
            activeNames: [],
            questionList: [],
            surveyCnt: 0,
            surveyFilterList: []
        }
    },
    methods: {
        exportExcel: function () {
            let app = this
            ajaxPostJSON(this.urls.getExportId, this.queryEntity,
                function (result) {
                    let url = result.data
                    window.location.href = app.urls.exportExcel + '?ExcelId=' + url
                }, function () {

                })

        },
        addSurveyFilter: function () {
            this.filter.surveyFilterList.push({
                index: this.filter.surveyCnt++,
                id: '',
                searchCondition: '',
                searchKey: ''
            })
        },
        submitQuestionByIndex: function (filterCondition) {
            for (let i = 0; i < this.filter.surveyFilterList.length; i++)
                if (this.filter.surveyFilterList[i].index === filterCondition.index)
                    this.filter.surveyFilterList[i] = JSON.parse(JSON.stringify(filterCondition))
        },
        deleteQuestionByIndex: function (index) {
            let toDelete = -1
            for (let i = 0; i < this.filter.surveyFilterList.length; i++)
                if (this.filter.surveyFilterList[i].index === index)
                    toDelete = i
            this.filter.surveyFilterList.splice(toDelete, 1)
        },
        queryData: function () {
            this.queryEntity.surveyEntity.questions = JSON.parse(JSON.stringify(this.filter.surveyFilterList))
            this.queryEntity.surveyEntity.questions.forEach(function (item) {
                delete item.index
            })

            let app = this
            app.table.tableData = []
            ajaxPostJSON(this.urls.getAnsListByConditions, this.queryEntity,
                function (result) {
                    let r = result.data
                    Object.keys(r).forEach(function (key) {
                        let ret = {}
                        r[key].ansEntity.ansList.forEach(function (item) {
                            ret[item.questionId] = item.answer
                        })
                        ret = {...ret, ...r[key].userConditions}
                        app.table.tableData.push(ret)
                    })
                    app.fullScreenLoading = false
                }, function () {
                    console.log('error')
                    app.fullScreenLoading = false
                }, false)
        },
        changeSort: function (val) {
            let prop = val.prop
            if (prop !== undefined) {
                return
            }
            let order = val.order
            let index = parseInt(val.column.label.split('.')[0])
            let toDelete = -1
            for (let i = 0; i < this.queryEntity.sortConditions.length; i++) {
                if (Math.abs(this.queryEntity.sortConditions[i]) === index) {
                    toDelete = i
                }
            }
            this.queryEntity.sortConditions.splice(toDelete, 1)

            if (order != null) {
                this.queryEntity.sortConditions.push(order === 'ascending' ? index : -index)
            }
            this.queryData()
        }
    },
    created: function () {
        this.showWindow = true
        this.queryEntity.surveyEntity.id = getSessionStorage('detail-survey-id')
        this.user = JSON.parse(getSessionStorage('user'))

        //获取题目信息
        let app = this
        this.fullScreenLoading = true
        ajaxPostJSON(this.urls.getSurvey, this.queryEntity.surveyEntity,
            function (result) {
                let r = result.data[0]
                app.filter.questionList = r.questions

                app.surveyTitle = r.title
                r.questions.forEach(function (item) {
                    app.table.questionList.push({
                        'id': item.id,
                        'title': item.title,
                        'index': item.index,
                        'isPrivate': item.isPrivate
                    })
                })
            },
            function () {
                console.log('error')
                app.fullScreenLoading = false
            }, false)

        //获取数据
        this.queryData()
        delSessionStorage('detail-survey-id')
    }
})