import { Styles } from "@ijstech/components";
const Theme = Styles.Theme.ThemeVars;

export const markdownStyle = Styles.style({
  overflowWrap: 'break-word',
  color: Theme.text.primary
})

export const inputStyle = Styles.style({
  $nest: {
    '> input': {
      textAlign: 'right'
    },
    'input[readonly]': {
      cursor: 'default'
    }
  }
})
