@extends('layouts.auth')
@section('title')
    Restablecer la contraseña
@endsection
@section('content')
    <div class="d-flex flex-column flex-column-fluid align-items-center justify-content-center p-4">
        <div class="col-12 text-center">
            <a href="{{ url('/') }}" class="image mb-7 mb-sm-10">
                <img alt="Logo" src="{{ asset(getSettingValue('logo')) }}" class="img-fluid logo-fix-size">
            </a>
        </div>
        <div class="width-540">
            @include('flash::message')
            @include('layouts.errors')
        </div>
        <div class="bg-white rounded-15 shadow-md width-540 px-5 px-sm-7 py-10 row mx-auto">
            <h1 class="text-center mb-7">Configurar nueva contraseña</h1>
            <form method="POST" action="{{ url('/password/reset') }}" id="">
                @csrf
                <input type="hidden" name="token" value="{{ $token }}">
                <!--Email-->
                <div class="mb-sm-7 mb-4">
                    <label for="email" class="form-label">
                        Email<span class="required"></span>
                    </label>
                    <input id="email" class="form-control form-control-solid {{ $errors->has('email') ? ' is-invalid' : '' }}" type="email"
                           value="{{ old('email') }}"
                           required autofocus name="email" autocomplete="off"
                           placeholder="Correo electrónico"/>
                    <div class="invalid-feedback">
                        {{ $errors->first('email') }}
                    </div>
                </div>
               
                {{--Password--}}
                <div class="mb-sm-7 mb-4">
                    <label class="form-label"
                           for="password">Contraseña</label>
                    <div class="mb-3 position-relative">
                        <input id="password" class="form-control form-control-solid {{ $errors->has('password') ? ' is-invalid': '' }}"
                               type="password"
                               name="password"
                               required autocomplete="off" placeholder="Contraseña"/>
                    </div>
                    <div class="invalid-feedback">
                        {{ $errors->first('password') }}
                    </div>
                </div>
               
                <!-- Confirm Password -->
                <div class="fv-row mb-5">
                    <label class="form-label "
                           for="password_confirmation">Confirmar Contraseña</label>
                    <input class="form-control  form-control-solid {{ $errors->has('password_confirmation') ? ' is-invalid': '' }}" type="password" id="password_confirmation" name="password_confirmation" placeholder="Confirmar contraseña" autocomplete="off"/>
                    <div class="invalid-feedback">
                        {{ $errors->first('password_confirmation') }}
                    </div>
                </div>

                <div class="text-center">
                    <button type="submit" class="btn btn-primary">
                        <span class="indicator-label">Establecer una nueva contraseña</span>
                        {{--                        <span class="indicator-progress">{{__('messages.common.please_wait')}}--}}
                        {{--									<span class="spinner-border spinner-border-sm align-middle ms-2"></span></span>--}}
                    </button>
                </div>
            </form>
        </div>
@endsection
