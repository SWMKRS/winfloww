function ComingSoon() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      padding: '40px',
      textAlign: 'center'
    }}>
      <div style={{
        fontSize: '48px',
        marginBottom: '24px'
      }}>️</div>
      <h2 style={{
        fontSize: '19px',
        fontWeight: 600,
        color: '#000',
        marginBottom: '12px'
      }}>
        Technical Difficulties
      </h2>
      <p style={{
        fontSize: '16px',
        color: '#616161',
        maxWidth: '400px'
      }}>
        Could not connect to our servers. Please try again later.
      </p>
    </div>
  );
}

export default ComingSoon;

