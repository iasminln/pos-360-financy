import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@apollo/client/react";
import { Eye, EyeClosed, Lock, LogIn, Mail, User as UserIcon } from "lucide-react";
import { CardInitial } from "@/components/layout/card-initial";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { REGISTER_MUTATION } from "@/graphql/operations";
import { useAuth } from "@/context/auth-context";
import { getErrorMessage } from "@/lib/errors";
import type { User } from "@/lib/types";

const schema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(8, "A senha deve ter no mínimo 8 caracteres"),
});

type FormValues = z.infer<typeof schema>;

export function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const [registerMutation] = useMutation(REGISTER_MUTATION);

  const onSubmit = handleSubmit(async (values) => {
    setError("");
    try {
      const { data } = await registerMutation({
        variables: values,
      });
      const payload = data as {
        register: { token: string; user: User };
      };
      login(payload.register.token, payload.register.user);
      navigate("/", { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, "Não foi possível criar a conta"));
    }
  });

  return (
    <CardInitial
      title="Criar conta"
      subtitle="Comece a controlar suas finanças ainda hoje"
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Nome completo</Label>
          <Input
            id="name"
            placeholder="Seu nome completo"
            leftIcon={<UserIcon className="h-4 w-4" />}
            {...register("name")}
          />
          {errors.name && (
            <p className="mt-1 text-xs text-danger">{errors.name.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            placeholder="mail@exemplo.com"
            leftIcon={<Mail className="h-4 w-4" />}
            {...register("email")}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-danger">{errors.email.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Digite sua senha"
            leftIcon={<Lock className="h-4 w-4" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <EyeClosed className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            }
            {...register("password")}
          />
          <p className="mt-1 text-xs text-gray-500">
            A senha deve ter no mínimo 8 caracteres
          </p>
          {errors.password && (
            <p className="mt-1 text-xs text-danger">
              {errors.password.message}
            </p>
          )}
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}

        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting ? "Cadastrando..." : "Cadastrar"}
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-sm text-gray-500">ou</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <p className="mb-3 text-center text-sm text-gray-500">Já tem uma conta?</p>
      <Link to="/">
        <Button variant="secondary" size="lg" className="w-full">
          <LogIn className="h-4 w-4" />
          Fazer login
        </Button>
      </Link>
    </CardInitial>
  );
}
