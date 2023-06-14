@extends('layouts.auth')
@section('title')
Olvidaste tu contraseña
@endsection
@section('content')
<div class="d-flex flex-column flex-column-fluid align-items-center justify-content-center p-0">
    <div class="col-12 text-center">
        <a href="{{ route('front.search.jobs') }}" class="image mb-7 mb-sm-10">
            <img alt="Logo" src="{{ asset(getSettingValue('logo')) }}" class="img-fluid logo-fix-size">
        </a>
    </div>
    <div class="width-540">
        @include('flash::message')
        @include('front_web.layouts.errors')
        @if (session('status'))
            <div class="alert alert-success">
                {{ session('status') }}
            </div>
        @endif
    </div>
    <div class="bg-theme-white rounded-15 shadow-md width-540 px-5 px-sm-7 py-10 mx-auto">
        <div class="text-center">
            <h1 class="text-center mb-7">¿Olvidaste tu contraseña?</h1>
            <div class="mb-4">
            Ingrese su correo electrónico para restablecer su contraseña.
            </div>
        </div>
        <form method="POST" action="{{ route('password.email') }}">
            @csrf
            <div class="mb-sm-7 mb-4">
                <label for="formInputEmail" class="form-label">
                    Correo electrónico:<span class="required"></span>
                </label>
                <input class="form-control" type="email"
                       placeholder="Tu correo electrónico" name="email" autocomplete="off" value="{{ old('email') }}" required/>
            </div>

            <div class="d-flex justify-content-center">
                <button type="submit" class="btn btn-primary">Restablecer contraseña</button>
                <a href="{{ route('front.candidate.login') }}" class="btn btn-secondary ms-3">Cancelar</a>
            </div>
        </form>
    </div>
</div>

@endsection
