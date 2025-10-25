  useEffect(() => {
    const storedToken = sessionStorage.getItem("konyx_token");

    const verifyToken = async (token: string) => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/verify`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Token inválido");
        const data = await res.json();
        if (data.valid) {
          setTokenState(token);
        } else {
          sessionStorage.removeItem("konyx_token");
          setTokenState(null);
        }
      } catch {
        sessionStorage.removeItem("konyx_token");
        setTokenState(null);
      } finally {
        setLoading(false);
      }
    };

    if (storedToken) {
      verifyToken(storedToken);
    } else {
      setLoading(false);
    }
  }, []);
