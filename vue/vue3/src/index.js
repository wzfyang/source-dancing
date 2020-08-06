import { reactive } from "./reactivity";
import { computed } from "./reactivity/computed";

debugger
const state = reactive({name:'wzy', age: 20, arr: [1, 2, 3]});

let myApp = computed(() => {
    console.log('myApp', 'computed');
    return state.age + 10;
})

console.log('myApp', 'result', myApp.value);