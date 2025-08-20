// Update this page (the content is just a fallback if you fail to update the page)

const Index = () => {
  return (
    <div 
      className="min-h-screen flex items-center justify-center" 
      style={{
        backgroundImage: 'url(/src/assets/17580.jpg)',
        backgroundSize: 'cover',
        backgroundAttachment: 'fixed',
        backgroundPosition: 'center'
      }}
    >
      <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-elegant p-12 border border-border text-center max-w-md mx-4">
        <h1 className="text-4xl font-bold mb-4 text-foreground">Welcome to Your Blank App</h1>
        <p className="text-xl text-muted-foreground">Start building your amazing project here!</p>
      </div>
    </div>
  );
};

export default Index;
