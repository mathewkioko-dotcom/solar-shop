import '../../styles/svg-icon.css'

function SvgIcon({ src, size = 20, className = '', ariaHidden = true, label }) {
  const accessibleProps = ariaHidden
    ? { 'aria-hidden': true }
    : { role: 'img', 'aria-label': label }

  return (
    <span
      className={`svg-icon ${className}`.trim()}
      style={{
        '--svg-icon-size': typeof size === 'number' ? `${size}px` : size,
        WebkitMaskImage: `url("${src}")`,
        maskImage: `url("${src}")`,
      }}
      {...accessibleProps}
    />
  )
}

export default SvgIcon
