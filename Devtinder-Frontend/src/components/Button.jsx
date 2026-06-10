export default function Button({ children, variant = 'primary', className = '', ...props }) {
  const variants = {
    primary: 'btn-primary',
    outline: 'btn-outline',
    danger: 'btn-danger',
  }
  return (
    <button className={`${variants[variant] || variants.primary} ${className}`} {...props}>
      {children}
    </button>
  )
}
