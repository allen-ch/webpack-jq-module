// rem根字号设置
export default {
    beforeMount () {
        this.filterRem();
        window.onresize = this.filterRem;
    },
    methods: {
        filterRem () {
            let deviceWidth = document.documentElement.clientWidth;
            if (deviceWidth > 750) deviceWidth = 750;
            document.documentElement.style.fontSize = deviceWidth / 10 + 'px';
        }
    }
};
