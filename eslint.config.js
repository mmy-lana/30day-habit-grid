import pluginVue from 'eslint-plugin-vue';
import { withVueTs, vueTsConfigs } from '@vue/eslint-config-typescript';

export default withVueTs(
  pluginVue.configs['flat/recommended'],
  vueTsConfigs.recommended,
  { rules: { 'no-console': ['warn', { allow: ['warn', 'error'] }] } },
  { ignores: ['dist', 'node_modules'] },
);