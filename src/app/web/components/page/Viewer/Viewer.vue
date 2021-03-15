<template lang="pug">
    canvas(id="render-context" ref="canvas")
</template>

<script>
import {init as initViewer, free as freeViewer} from '../../../viewer/main'

export default {
    mounted() {
        window.addEventListener('resize', () => this.setSize())
        this.setSize();
        const ugh = {
            canvas: this.$refs.canvas,
            addEventHandler: (name, fn) => document.addEventListener(name, fn)
        }
        initViewer(ugh, '/id1/maps/eoem3.bsp','/id1/palette.lmp', {
            cameraWobble: true,
            sampleInput: false
        })
    },
    destroyed() {
        freeViewer();
    },
    methods: {
        setSize() {
            this.$refs.canvas.width = (document.documentElement.clientWidth <= 320) ? 320 : document.documentElement.clientWidth;
            this.$refs.canvas.height = 300
        }
    }
}
</script>