import { Styles } from "@ijstech/components";

Styles.Theme.defaultTheme.background.modal = "#fff";
Styles.Theme.applyTheme(Styles.Theme.defaultTheme);

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
      background: '#ffffff',
      border: 0,
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