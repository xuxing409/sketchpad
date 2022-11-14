
import { ref } from 'vue'
import { useEventListener } from './useEventListener'
export  function useMouse(target:HTMLElement | Window | string, callback?:(x:number,y:number) => void) {
    const x = ref(0)
    const y = ref(0)

    useEventListener(target, 'mousemove', (event)=> {
        const { pageX, pageY } = event;
        x.value = pageX
        y.value = pageY
        callback && callback(pageX, pageY)
    })
    return {x, y}
}