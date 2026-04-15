import $ from 'jquery'

type ToastType = 'success' | 'error' | 'info' | 'warning'

const BULMA_CLASS: Record<ToastType, string> = {
  success: 'is-success',
  error: 'is-danger',
  info: 'is-info',
  warning: 'is-warning',
}

const ICON_CLASS: Record<ToastType, string> = {
  success: 'fas fa-check-circle',
  error: 'fas fa-exclamation-circle',
  info: 'fas fa-info-circle',
  warning: 'fas fa-exclamation-triangle',
}

export function showToast(message: string, type: ToastType = 'info', duration = 3000) {
  // Ensure container exists
  if ($('#toast-container').length === 0) {
    $('<div id="toast-container"></div>').appendTo('body')
  }

  const $toast = $('<div class="notification toast-item"></div>')
    .addClass(BULMA_CLASS[type])
    .hide()

  const $icon = $('<span class="icon mr-2"></span>')
    .append($(`<i class="${ICON_CLASS[type]}"></i>`))

  const $text = $('<span></span>').text(message)

  const $close = $('<button class="delete"></button>')

  $toast
    .append($close)
    .append(
      $('<div class="is-flex is-align-items-center"></div>')
        .append($icon)
        .append($text),
    )

  $('#toast-container').prepend($toast)

  // jQuery animations: slideDown + fadeIn
  $toast.slideDown(300).fadeIn(300)

  // Close button handler using jQuery event binding
  $close.click(function () {
    $toast.fadeOut(250, function () {
      $(this).remove()
    })
  })

  // Auto-dismiss after duration
  setTimeout(() => {
    $toast.fadeOut(400, function () {
      $(this).remove()
    })
  }, duration)
}
