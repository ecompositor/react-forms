import componentTypes from '@data-driven-forms/react-form-renderer/dist/cjs/component-types';

const options = [
  {
    label: 'Morton',
    value: 'Jenifer'
  },
  {
    label: 'Vega',
    value: 'Cervantes'
  },
  {
    label: 'Gilbert',
    value: 'Wallace'
  },
  {
    label: 'Jami',
    value: 'Cecilia'
  },
  {
    label: 'Ebony',
    value: 'Kay'
  }
];

const selectSchema = {
  fields: [
    {
      component: componentTypes.SELECT,
      name: 'simple-select',
      label: 'Simple-select',
      options
    },
    {
      component: componentTypes.SELECT,
      name: 'disabled-select',
      label: 'Disabled-select',
      options,
      isDisabled: true
    }
  ]
};

export default selectSchema;