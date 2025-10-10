from pydantic import BaseModel

class LoginRequest(BaseModel):
    username: str
    password: str

class PasswordUpdate(BaseModel):
    password: str

class ApiUpdate(BaseModel):
    apiKissoro: str | None = None
    apiEnPlural: str | None = None

class ExportRequest(BaseModel):
    formatoImport: str
    formatoExport: str
    empresa: str
    fechaFactura: str
    proyecto: str
    cuenta: str
    ficheroNombre: str
    usuario: str
