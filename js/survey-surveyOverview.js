let app = new Vue({
    el: "#app",
    data:{
        form:{
            title:"",
            description:"",
            questions:[

            ]
        },
        questionEntity:{
            title:"",
            questionId:"",
            answer:"",
        },
        urls:{
            getAnsListByPerson:serverUrl+"/api/survey/data/getAnsListByPerson"
        },
        AnsEntity: {
            respondentId : ""
        },
        params:{
            respondentId: "",
            surveyId: ""
        }
    },
    methods:{

    },
    created(){
        setSessionStorage("overview-survey-id","f98d238f86414a53ab4d88113c7bf0d9")
        setSessionStorage("overview-respondent-id","a84aefdba02c41868df9fad05405fe8f")

        this.params.surveyId = getSessionStorage("overview-survey-id")
        this.params.respondentId = getSessionStorage("overview-respondent-id")
        if(this.params.respondentId == null){
            this.$message("错误")
        }
        delSessionStorage("overview-respondent-id")
        if(this.params.surveyId == null){
            this.$message("错误")
        }
        delSessionStorage("overview-survey-id")

        this.AnsEntity.respondentId = this.params.respondentId
        let app = this
        ajaxPostJSON(this.urls.getAnsListByPerson,this.AnsEntity,function (d) {
            for(i in d.data){
                if(d.data[i].answer.surveyId == app.params.surveyId){
                    app.form.title = d.data[i].survey.title
                    app.form.description = d.data[i].survey.description
                    for(j in d.data[i].answer.ansList){
                        var tmp_questionEntity ={
                            title:"",
                            questionId:"",
                            answer:"",
                        }
                        tmp_questionEntity.questionId = d.data[i].answer.ansList[j].questionId
                        tmp_questionEntity.answer = d.data[i].answer.ansList[j].answer
                        tmp_questionEntity.title = d.data[i].survey.questions[j].title
                        app.form.questions.push(tmp_questionEntity)
                    }

                }
            }
        },function (d) {},true)
    }
})