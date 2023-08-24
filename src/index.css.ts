import { Styles } from "@ijstech/components";
const Theme = Styles.Theme.ThemeVars;

export const imageStyle = Styles.style({
  $nest: {
    '&>img': {
      maxWidth: 'unset',
      maxHeight: 'unset',
      borderRadius: 4
    }
  }
})

export const markdownStyle = Styles.style({
  overflowWrap: 'break-word',
  color: Theme.text.primary
})

export const inputStyle = Styles.style({
  $nest: {
    '> input': {
      background: Theme.input.background,
      color: Theme.input.fontColor,
      padding: '0.25rem 0.5rem',
      textAlign: 'right'
    },
    'input[readonly]': {
      cursor: 'default'
    }
  }
})

export const tokenSelectionStyle = Styles.style({
  $nest: {
    '.custom-border > i-hstack': {
      display: 'none'
    },
    '#gridTokenInput': {
      paddingLeft: '0 !important'
    },
    '#pnlSelection > i-hstack': {
      justifyContent: 'flex-start !important'
    }
  }
})

export const centerStyle = Styles.style({
  textAlign: 'center'
})
