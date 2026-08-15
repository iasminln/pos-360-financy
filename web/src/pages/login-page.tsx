import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@apollo/client/react";
import { Eye, EyeClosed, Lock, Mail, UserPlus2 } from "lucide-react";
import { CardInitial } from "@/components/layout/card-initial";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LOGIN_MUTATION } from "@/graphql/operations";
import { useAuth } from "@/context/auth-context";
import { getErrorMessage } from "@/lib/errors";
import type { User } from "@/lib/types";

const schema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
  remember: z.boolean().optional(),
});

type FormValues = z.infer<typeof schema>;

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const rememberedEmail = localStorage.getItem("financy_remember_email") ?? "";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: rememberedEmail,
      password: "",
      remember: Boolean(rememberedEmail),
    },
  });

  const [loginMutation] = useMutation(LOGIN_MUTATION);

  const onSubmit = handleSubmit(async (values) => {
    setError("");
    try {
      const { data } = await loginMutation({
        variables: { email: values.email, password: values.password },
      });
      const payload = data as {
        login: { token: string; user: User };
      };
      if (values.remember) {
        localStorage.setItem("financy_remember_email", values.email);
      } else {
        localStorage.removeItem("financy_remember_email");
      }
      login(payload.login.token, payload.login.user);
      navigate("/", { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, "Não foi possível fazer login"));
    }
  });

  return (
    <CardInitial
      title="Fazer login"
      subtitle="Entre na sua conta para continuar"
    >
      <form onSubmit={onSubmit} className="space-y-4">
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
          {errors.password && (
            <p className="mt-1 text-xs text-danger">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between text-sm">
          <label className="inline-flex items-center gap-2 text-gray-700">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-border text-brand-base"
              {...register("remember")}
            />
            Lembrar-me
          </label>
          <span className="cursor-default text-brand-base">Recuperar senha</span>
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}

        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting ? "Entrando..." : "Entrar"}
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-sm text-gray-500">ou</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <p className="mb-3 text-center text-sm text-gray-500">
        Ainda não tem uma conta?
      </p>
      <Link to="/register">
        <Button variant="secondary" size="lg" className="w-full">
          <UserPlus2 className="h-4 w-4" />
          Criar conta
        </Button>
      </Link>
    </CardInitial>
  );
}
