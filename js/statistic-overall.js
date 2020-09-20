let card = Vue.extend({
    props: {
        'entity': {
            type: Object
        }
    },
    template: `
        <el-card>
            <div slot="header">
                ({{type}}){{entity.question.index}}.{{entity.question.title}}
            </div>
            <div style="height: 30vh">
                <el-table :data="tableData.filter(data => !search || data.answer.includes(search))" 
                          :default-sort = "{prop: 'answer', order: 'descending'}">
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


let app = new Vue({
    el: '#app',
    components: {
        'my-card': card
    },
    data: {
        showWindow: false,
        fullScreenLoading: false,
        urls: {
            getSurveyStatistics: serverUrl + '/api/survey/data/getSurveyStatistics'
        },
        queryEntity: {
            userConditions: {},
            surveyEntity: {
                id: '',
                questions: []
            }
        },
        resultList: []
    },
    created: function () {
        //todo 权限检查
        this.showWindow = true
        this.queryEntity.surveyEntity.id = '498326cf632f4c83a8ef083ddfd7b1ac'

        //获取数据
        let app = this
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
})