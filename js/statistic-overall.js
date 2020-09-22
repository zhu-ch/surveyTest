let card = Vue.extend({
    props: {
        'entity': {
            type: Object
        }
    },
    template: `
        <el-card>
            <div slot="header">
                <strong>第{{entity.question.index}}题：</strong>{{entity.question.title}}【{{type}}题】
            </div>
            <div>
                <el-table :data="tableData.filter(data => !search || data.answer.includes(search))" 
                          :default-sort = "{prop: 'answer', order: 'descending'}" max-height="250"
                          @sort-change="changeSort">
                     <el-table-column type="index" label="序号" width="50" align="center"></el-table-column>
                    <el-table-column prop="person" label="用户" sortable align="center"></el-table-column>
                    <el-table-column prop="answer" label="答案文本" sortable align="center"></el-table-column>
                    <el-table-column align="right">
                      <template slot="header" slot-scope="scope">
                        <el-input v-model="search" size="mini" placeholder="输入关键字搜索"/>
                      </template>
                    </el-table-column>
                  </el-table>
            </div>
            <div v-if="useECharts" style="margin-top: 10px; margin-bottom: 10px">
                <el-button @click="drawStrip" icon="el-icon-tickets" 
                            :type="display==='strip' ? 'primary' : 'plain'">条形图</el-button>
                <el-button @click="drawBar" icon="el-icon-s-data"
                            :type="display==='bar' ? 'primary' : 'plain'">柱状图</el-button>
                <el-button @click="drawPie" icon="el-icon-pie-chart"
                            :type="display==='pie' ? 'primary' : 'plain'">饼图</el-button>
            </div>
            <div :id="'chart-area-' + entity.question.index" v-show="display !== ''"
                   style="width:100vw; height:35vh;"></div>
        </el-card>
    `,
    data() {
        return {
            useECharts: false,
            display: '',
            tableData: [],
            search: ''
        }
    },
    methods: {
        drawStrip: function () {
            let id = 'chart-area-' + this.entity.question.index
            let myChart = echarts.init(document.getElementById(id));
            myChart.clear()
            if (this.display === 'strip') {
                this.display = ''
                return
            }
            this.display = 'strip'
            let option = {
                title: {
                    text: this.entity.question.title + ' 条形图'
                },
                tooltip: {
                    trigger: 'item',
                    formatter: '{a} <br/>{b} : {c}'
                },
                legend: {
                    data: ['数量']
                },
                xAxis: {
                    type: 'value'
                },
                yAxis: {
                    data: this.entity.question.answerList,
                    type: 'category'
                },
                series: [{
                    name: '数量',
                    type: 'bar',
                    data: this.barData
                }]
            }
            myChart.setOption(option)
        },
        drawBar: function () {
            let id = 'chart-area-' + this.entity.question.index
            let myChart = echarts.init(document.getElementById(id));
            myChart.clear()
            if (this.display === 'bar') {
                this.display = ''
                return
            }
            this.display = 'bar'
            let option = {
                title: {
                    text: this.entity.question.title + ' 柱状图'
                },
                tooltip: {
                    trigger: 'item',
                    formatter: '{a} <br/>{b} : {c}'
                },
                legend: {
                    data: ['数量']
                },
                xAxis: {
                    data: this.entity.question.answerList,
                },
                yAxis: {},
                series: [{
                    name: '数量',
                    type: 'bar',
                    data: this.barData
                }]
            }
            myChart.setOption(option)
        },
        drawPie: function () {
            let id = 'chart-area-' + this.entity.question.index
            let myChart = echarts.init(document.getElementById(id));
            myChart.clear()
            if (this.display === 'pie') {
                this.display = ''
                return
            }
            this.display = 'pie'
            let option = {
                title: {
                    text: this.entity.question.title + ' 饼图'
                },
                tooltip: {
                    trigger: 'item',
                    formatter: '{a} <br/>{b} : {c} ({d}%)'
                },
                legend: {
                    orient: 'vertical',
                    left: 'left',
                    top: '20%',
                    data: this.entity.question.answerList
                },
                series: [
                    {
                        name: '数量',
                        type: 'pie',
                        radius: '55%',
                        center: ['50%', '60%'],
                        data: this.pieData,
                        emphasis: {
                            itemStyle: {
                                shadowBlur: 10,
                                shadowOffsetX: 0,
                                shadowColor: 'rgba(0, 0, 0, 0.5)'
                            }
                        }
                    }
                ]
            }
            myChart.setOption(option)
        },
        changeSort(val) {
            console.log(val) // column: {…} order: "ascending" prop: "date"
            // 根据当前排序重新获取后台数据,一般后台会需要一个排序的参数

        }
    },
    computed: {
        type: function () {
            switch (this.entity.question.type) {
                case 'SINGLE':
                    return '单选'
                case 'MULTIPLE':
                    return '多选'
                case 'FILL_BLANK':
                    return '填空'
                case 'ORDER':
                    return '排序'
            }
        },
        barData: function () {
            let ret = []
            let app = this
            Object.keys(this.entity.statistics).forEach(function (key) {
                ret.push(app.entity.statistics[key])
            })
            return ret
        },
        pieData: function () {
            let ret = []
            let app = this
            Object.keys(this.entity.statistics).forEach(function (key) {
                ret.push({'value': app.entity.statistics[key], 'name': key})
            })
            return ret
        }
    },
    mounted: function () {
        let app = this
        if (this.entity.question.type !== 'FILL_BLANK')
            this.useECharts = true
        Object.keys(this.entity.summary).forEach(function (key) {
            app.tableData.push({'answer': app.entity.summary[key], 'person': key})
        })
    }
})

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
        'my-card': card,
        'my-survey-filter': mySurveyFilter
    },
    data: {
        user: {},
        showWindow: false,
        fullScreenLoading: false,
        urls: {
            getSurveyStatistics: serverUrl + '/api/survey/data/getSurveyStatistics',
            getSurvey: serverUrl + '/api/survey/getSurveyByConditions',
        },
        queryEntity: {
            userConditions: {},
            surveyEntity: {
                id: '',
                questions: []
            }
        },
        resultList: [],
        filter: {
            activeNames: [],
            questionList: [],
            surveyCnt: 0,
            surveyFilterList: []
        }
    },
    methods: {
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
        getSurveyStatistics: function () {
            this.queryEntity.surveyEntity.questions = JSON.parse(JSON.stringify(this.filter.surveyFilterList))
            this.queryEntity.surveyEntity.questions.forEach(function (item) {
                delete item.index
            })

            let app = this
            this.resultList = []
            this.fullScreenLoading = true
            ajaxPostJSON(this.urls.getSurveyStatistics, this.queryEntity,
                function (result) {
                    app.fullScreenLoading = false
                    Object.keys(result.data).forEach(function (key) {
                        app.resultList.push(result.data[key])
                    })
                }, function () {
                    app.fullScreenLoading = false
                    app.$message({
                        message: '未知错误',
                        type: 'error'
                    })
                })
        }
    },
    created: function () {
        this.showWindow = true
        this.queryEntity.surveyEntity.id = getSessionStorage('overall-survey-id')
        this.user = JSON.parse(getSessionStorage('user'))

        //获取题目信息
        let app = this
        this.fullScreenLoading = true
        ajaxPostJSON(this.urls.getSurvey, this.queryEntity.surveyEntity,
            function (result) {
                let r = result.data[0]
                app.filter.questionList = r.questions
            },
            function () {
                console.log('error')
                app.fullScreenLoading = false
            }, false)

        //获取数据
        this.getSurveyStatistics()
        delSessionStorage('overall-survey-id')

    }
})