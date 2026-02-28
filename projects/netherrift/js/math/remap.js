export const remap = (v,i0,i1,o0,o1) => o0 + ((v-i0)/(i1-i0))*(o1-o0);
