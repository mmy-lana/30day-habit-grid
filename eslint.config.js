import pluginVue from 'eslint-plugin-vue';
import { withVueTs, vueTsConfigs } from '@vue/eslint-config-typescript';

export default withVueTs(
  pluginVue.configs['flat/recommended'],
  vueTsConfigs.recommended,
  {
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      // `Heading`/`Modal` are intentional single-word atomic/molecular primitives (see PLAN §8).
      'vue/multi-word-component-names': ['error', { ignores: ['Heading', 'Modal'] }],
    },
  },
  { ignores: ['dist', 'node_modules'] },
);