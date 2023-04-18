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
  overflowWrap: 'break-word'
})

export const inputStyle = Styles.style({
  $nest: {
    '> input': {
      background: Theme.input.background,
      color: Theme.input.fontColor,
      padding: '0.25rem 0.5rem',
      textAlign: 'right'
    }
  }
})

export const tokenSelectionStyle = Styles.style({
  $nest: {
    'i-button.token-button': {
      justifyContent: 'start'
    }
  }
})

export const centerStyle = Styles.style({
  textAlign: 'center'
})
