let app=new Vue({
    el:'#app',
    data:{
        i:2,
        bool:false
    },
    methods:{
        add:function () {
            this.bool=true;

        },
        minus:function () {

        }
    },
    created:function () {
        //权限验证
        //页面初始化（数据加载）
    }
})